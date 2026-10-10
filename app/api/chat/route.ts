import {
  convertToModelMessages,
  generateText,
  streamText,
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
      system: SYSTEM_PROMPT,
      prompt:
        "The user typed /share with no tip. Briefly explain the format: /share followed by the tip they want to share anonymously.",
      maxOutputTokens: 200,
      maxRetries: 1,
    }).toUIMessageStreamResponse(streamErrorOptions);
  }

  const { text } = await generateText({
    model: baseModel,
    system: SHARE_ANONYMIZER_PROMPT,
    prompt: cmd.arg,
    maxOutputTokens: 400,
    maxRetries: 1,
  });
  const cleanTip = text.trim();

  if (cleanTip) {
    await rememberAndWait(cleanTip, SHARED_TIPS_NAMESPACE);
  }

  const namespace = namespaceFor(userId);
  const model = memoryEnabled
    ? withMemWal(baseModel, memwalOptions(namespace))
    : baseModel;

  return streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt:
      `The user just shared an anonymous tip to the community pool. ` +
      `The anonymized version stored was: "${cleanTip}". ` +
      `Confirm briefly that it was shared anonymously, show the cleaned ` +
      `version, and note that anyone can query it with /wisdom.`,
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
    system,
    prompt: cmd.arg || "What wisdom does the community pool hold?",
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
  if (cmd?.name === "share") return handleShare(cmd, safeId, withMemory);
  if (cmd?.name === "wisdom") return handleWisdom(cmd, safeId, withMemory);

  const baseModel = buildChatModel();
  const model = withMemory
    ? withMemWal(baseModel, memwalOptions(namespace))
    : baseModel;

  const instruction = cmd ? commandInstruction(cmd) : "";
  const system = instruction ? `${SYSTEM_PROMPT}\n\n${instruction}` : SYSTEM_PROMPT;
  const finalMessages = cmd
    ? withRewrittenPrompt(messages, effectivePrompt(cmd))
    : messages;

  const result = streamText({
    model,
    system,
    messages: await convertToModelMessages(finalMessages),
    // The GLM models are reasoning models: they need headroom for the
    // thinking trace before the final answer is produced.
    maxOutputTokens: 1500,
    // Provider switching is handled by the fallback chain, so keep outer
    // retries low to fail fast instead of hammering providers.
    maxRetries: 1,
  });

  return result.toUIMessageStreamResponse(streamErrorOptions);
}
