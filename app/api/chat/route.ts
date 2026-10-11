import {
  convertToModelMessages,
  generateText,
  streamText,
  type ModelMessage,
  type UIMessage,
} from "ai";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { buildChatModel } from "@/lib/providers";
import {
  SHARE_ANONYMIZER_PROMPT,
  commandInstruction,
  effectivePrompt,
  parseSlashCommand,
  type SlashCommand,
} from "@/lib/commands";
import {
  SHARED_TIPS_NAMESPACE,
  memwalOptions,
  namespaceFor,
  recallFromNamespace,
  rememberAndWait,
  sanitizeUserId,
} from "@/lib/memwal";

export const maxDuration = 90;

interface ChatRequest {
  messages: UIMessage[];
  userId?: string;
  /**
   * When false the request bypasses Walrus Memory entirely: no recall,
   * no save. Powers the memory on/off comparison in the chat UI.
   * Defaults to true.
   */
  memoryEnabled?: boolean;
}

/**
 * Commands whose answers must be grounded in the visitor's full history.
 * For these, memories are injected directly via a broad recall instead of
 * relying on the middleware's relevance filter, which drops memories for
 * broad analytical queries.
 */
const MEMORY_GROUNDED_COMMANDS = new Set([
  "insight",
  "blindspot",
  "mybook",
  "testme",
  "timetravel",
  "mentor",
]);

const HELP_TEXT = `Available commands:

/timetravel <scenario> Simulate an alternate present from a past decision, grounded in your history.
/mentor <name> Get advice in the voice of a famous figure who knows your life details.
/insight Surface hidden patterns across your memories.
/blindspot Resurface forgotten ideas and promises, with dates.
/mybook Draft chapters of your life story from your memories.
/testme Quiz yourself on one fact from your memories.
/share <tip> Share a tip anonymously to the community pool.
/wisdom <question> Get answers from the community tip pool.
/incognito <label> <secret> Store a secret with full browser side encryption.
/reveal <label> Decrypt a stored secret locally.`;

/**
 * Deterministic /help: no model call, the list is always complete
 * and instant. Emits a minimal UIMessage SSE stream.
 */
function helpResponse(): Response {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const chunks: string[] = [];
  for (let i = 0; i < HELP_TEXT.length; i += 120) {
    chunks.push(HELP_TEXT.slice(i, i + 120));
  }
  const lines = [
    `data: {"type":"start"}`,
    ``,
    `data: {"type":"start-step"}`,
    ``,
    `data: {"type":"text-start","id":"0"}`,
    ``,
    ...chunks.flatMap((c) => [
      `data: {"type":"text-delta","id":"0","delta":"${esc(c)}"}`,
      ``,
    ]),
    `data: {"type":"text-end","id":"0"}`,
    ``,
    `data: {"type":"finish-step"}`,
    ``,
    `data: {"type":"finish","finishReason":"stop"}`,
    ``,
    `data: [DONE]`,
    ``,
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

/**
 * Some OpenAI compatible providers ignore the system role, which would
 * silently drop the Remora persona. The persona is therefore sent as
 * the first user message instead of the system parameter, so behavior
 * is identical on every provider.
 */
function withPersonaLead(
  systemText: string,
  messages: ModelMessage[]
): ModelMessage[] {
  return [
    {
      role: "user",
      content:
        "Follow these instructions for our entire conversation:\n\n" +
        systemText,
    },
    ...messages,
  ];
}

/** Plain text of the latest user message. */
function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return messages[i].parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("\n");
    }
  }
  return "";
}

/** Returns the messages with the latest user text replaced. */
function withRewrittenPrompt(messages: UIMessage[], text: string): UIMessage[] {
  const out = [...messages];
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i].role === "user") {
      out[i] = { ...out[i], parts: [{ type: "text", text }] };
      break;
    }
  }
  return out;
}

/** Readable stream errors instead of the generic fallback text. */
const streamErrorOptions = {
  onError: (error: unknown) => {
    if (error instanceof Error) return error.message.slice(0, 300);
    return "Something went wrong talking to the model. Please try again.";
  },
};

/**
 * /share <tip>: anonymizes the tip with a dedicated model call, stores
 * the cleaned version in the opt in community pool, then confirms.
 * The raw message never reaches the shared pool.
 */
async function handleShare(
  cmd: SlashCommand,
  userId: string,
  memoryEnabled: boolean
): Promise<Response> {
  const baseModel = buildChatModel();

  if (!cmd.arg) {
    return streamText({
      model: baseModel,
      messages: withPersonaLead(SYSTEM_PROMPT, [
        {
          role: "user",
          content:
            "The user typed /share with no tip. Briefly explain the format: /share followed by the tip they want to share anonymously.",
        },
      ]),
      maxOutputTokens: 200,
      maxRetries: 1,
    }).toUIMessageStreamResponse(streamErrorOptions);
  }

  let cleanTip: string;
  try {
    const { text } = await generateText({
      model: baseModel,
      // Instruction goes in the user message: some providers ignore system.
      prompt: `${SHARE_ANONYMIZER_PROMPT}\n\nMessage to anonymize:\n${cmd.arg}`,
      maxOutputTokens: 400,
      maxRetries: 1,
    });
    cleanTip = text.trim();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return streamText({
      model: baseModel,
      messages: withPersonaLead(SYSTEM_PROMPT, [
        {
          role: "user",
          content:
            `The /share anonymizer failed with this error: ${detail.slice(0, 200)}. ` +
            `Tell the user the share failed and to try again in a moment.`,
        },
      ]),
      maxOutputTokens: 200,
      maxRetries: 1,
    }).toUIMessageStreamResponse(streamErrorOptions);
  }
  const tipToStore = cleanTip;

  try {
    if (tipToStore) {
      await rememberAndWait(tipToStore, SHARED_TIPS_NAMESPACE);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return streamText({
      model: baseModel,
      messages: withPersonaLead(SYSTEM_PROMPT, [
        {
          role: "user",
          content:
            `Storing the shared tip failed with this error: ${detail.slice(0, 200)}. ` +
            `Tell the user the share failed and to try again in a moment.`,
        },
      ]),
      maxOutputTokens: 200,
      maxRetries: 1,
    }).toUIMessageStreamResponse(streamErrorOptions);
  }

  const namespace = namespaceFor(userId);
  const model = memoryEnabled
    ? withMemWal(baseModel, memwalOptions(namespace))
    : baseModel;

  return streamText({
    model,
    messages: withPersonaLead(SYSTEM_PROMPT, [
      {
        role: "user",
        content:
          `The user just shared an anonymous tip to the community pool. ` +
          `The anonymized version stored was: "${tipToStore}". ` +
          `Confirm briefly that it was shared anonymously, show the cleaned ` +
          `version, and note that anyone can query it with /wisdom.`,
      },
    ]),
    maxOutputTokens: 400,
    maxRetries: 1,
  }).toUIMessageStreamResponse(streamErrorOptions);
}

/**
 * /wisdom <question>: answers from the opt in community tip pool.
 * Only the shared namespace is read. Private namespaces are untouched.
 */
async function handleWisdom(
  cmd: SlashCommand,
  userId: string,
  memoryEnabled: boolean
): Promise<Response> {
  const baseModel = buildChatModel();
  const namespace = namespaceFor(userId);

  const tips = cmd.arg
    ? await recallFromNamespace(SHARED_TIPS_NAMESPACE, cmd.arg, 10)
    : [];
  const context = tips.length
    ? tips.map((t, i) => `${i + 1}. ${t.text}`).join("\n")
    : "No community tips found for this question.";

  const system =
    SYSTEM_PROMPT +
    "\n\nThe user asks for community wisdom. Here are anonymized tips shared " +
    `by other visitors:\n${context}\nBase your answer on these when relevant. ` +
    "Say plainly if none apply. Never invent tips.";

  const model = memoryEnabled
    ? withMemWal(baseModel, memwalOptions(namespace))
    : baseModel;

  return streamText({
    model,
    messages: withPersonaLead(system, [
      {
        role: "user",
        content: cmd.arg || "What wisdom does the community pool hold?",
      },
    ]),
    maxOutputTokens: 800,
    maxRetries: 1,
  }).toUIMessageStreamResponse(streamErrorOptions);
}

export async function POST(req: Request) {
  const { messages, userId, memoryEnabled }: ChatRequest = await req.json();
  const safeId = sanitizeUserId(userId);
  const namespace = namespaceFor(safeId);
  const withMemory = memoryEnabled !== false;

  const cmd = parseSlashCommand(lastUserText(messages));
  if (cmd?.name === "help") return helpResponse();
  if (cmd?.name === "share") return handleShare(cmd, safeId, withMemory);
  if (cmd?.name === "wisdom") return handleWisdom(cmd, safeId, withMemory);

  const baseModel = buildChatModel();

  // Analytical commands get one authoritative memory list injected
  // directly. The middleware is bypassed for these turns so the model
  // never sees two conflicting memory sources.
  const isGroundedCommand =
    !!cmd && MEMORY_GROUNDED_COMMANDS.has(cmd.name) && withMemory;
  const model =
    withMemory && !isGroundedCommand
      ? withMemWal(baseModel, memwalOptions(namespace))
      : baseModel;

  let memoryBlock = "";
  if (isGroundedCommand) {
    const mems = await recallFromNamespace(
      namespace,
      "personal facts, history, goals, and traits",
      20
    );
    memoryBlock =
      "\n\nCOMPLETE VERIFIED MEMORY LIST for this visitor. There are no " +
      "other stored memories. Base your answer strictly on these:\n" +
      (mems.length > 0
        ? mems
            .map((m, i) => `${i + 1}. [${m.createdAt ?? "date unknown"}] ${m.text}`)
            .join("\n")
        : "(no memories stored yet)");
  }

  const instruction = cmd ? commandInstruction(cmd) : "";
  const system =
    SYSTEM_PROMPT + (instruction ? `\n\n${instruction}` : "") + memoryBlock;
  const finalMessages = cmd
    ? withRewrittenPrompt(messages, effectivePrompt(cmd))
    : messages;

  const result = streamText({
    model,
    messages: withPersonaLead(
      system,
      await convertToModelMessages(finalMessages)
    ),
    // The GLM models are reasoning models: they need headroom for the
    // thinking trace before the final answer is produced.
    maxOutputTokens: 1500,
    // Provider switching is handled by the fallback chain, so keep outer
    // retries low to fail fast instead of hammering providers.
    maxRetries: 1,
  });

  return result.toUIMessageStreamResponse(streamErrorOptions);
}
