import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { withFallback } from "@/lib/model-with-fallback";

export const maxDuration = 60;

const zai = createOpenAI({
  baseURL: "https://api.z.ai/api/paas/v4",
  apiKey: process.env.ZAI_API_KEY ?? "",
});

const mistral = createOpenAI({
  baseURL: "https://api.mistral.ai/v1",
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { messages, userId }: { messages: UIMessage[]; userId?: string } =
    await req.json();

  // Per-visitor memory namespace: the same browser keeps its memories
  // across sessions; different visitors never see each other's memories.
  const safeId = (userId ?? "anon").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) || "anon";
  const namespace = `remora-${safeId}`;

  // NB: use .chat() explicitly — the provider's default entrypoint targets
  // OpenAI's Responses API (/v1/responses), which Z.AI does not implement
  // (it only speaks /chat/completions, hence the 404s).
  //
  // Z.AI (primary) + Mistral (backup): both are non-Anthropic/OpenAI, so the
  // "Beyond the Big Two" bonus holds either way. If the free tier saturates
  // (429/5xx), the fallback answers instead of erroring.
  const llm = withFallback(
    zai.chat("glm-4.7-flash"),
    mistral.chat("mistral-small-latest")
  );

  const model = withMemWal(llm, {
    key: process.env.MEMWAL_PRIVATE_KEY ?? "",
    accountId: process.env.MEMWAL_ACCOUNT_ID ?? "",
    serverUrl:
      process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace,
    maxMemories: 5,
    autoSave: true,
    minRelevance: 0.3,
  });

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // glm-4.7-flash is a reasoning model: it needs headroom for its
    // thinking trace before the final answer is produced.
    maxOutputTokens: 1500,
    // Z.AI's free tier is flaky (intermittent 429s): retry transient errors.
    maxRetries: 4,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      // Surface a readable error instead of the generic "An error occurred."
      if (error instanceof Error) return error.message.slice(0, 300);
      return "Something went wrong talking to the model. Please try again.";
    },
  });
}
