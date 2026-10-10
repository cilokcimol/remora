import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { buildChatModel } from "@/lib/providers";
import { memwalOptions, namespaceFor, sanitizeUserId } from "@/lib/memwal";

export const maxDuration = 60;

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

export async function POST(req: Request) {
  const { messages, userId, memoryEnabled }: ChatRequest = await req.json();
  const namespace = namespaceFor(sanitizeUserId(userId));

  const baseModel = buildChatModel();
  const model =
    memoryEnabled === false
      ? baseModel
      : withMemWal(baseModel, memwalOptions(namespace));

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // The GLM models are reasoning models: they need headroom for the
    // thinking trace before the final answer is produced.
    maxOutputTokens: 1500,
    // Provider switching is handled by the fallback chain, so keep outer
    // retries low to fail fast instead of hammering providers.
    maxRetries: 1,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      // Surface a readable error instead of the generic fallback text.
      if (error instanceof Error) return error.message.slice(0, 300);
      return "Something went wrong talking to the model. Please try again.";
    },
  });
}
