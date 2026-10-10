import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { withFallback } from "@/lib/model-with-fallback";

const KELONTONG_BASE_URL = "https://api.kelontongai.id/v1";
const ZAI_BASE_URL = "https://api.z.ai/api/paas/v4";
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";

function openAICompatible(baseURL: string, apiKey: string | undefined) {
  return createOpenAI({ baseURL, apiKey: apiKey ?? "" });
}

/**
 * Builds the chat model with automatic failover across providers.
 *
 * Order: KelontongAI first, then Z.AI, then Mistral. A transient failure
 * (rate limit or server error) on one provider transparently moves the
 * request to the next, so the chat stays responsive when a single
 * provider is saturated.
 *
 * NB: call .chat() explicitly. The default entrypoint targets the
 * Responses API (/v1/responses), which Z.AI does not implement.
 */
export function buildChatModel(): LanguageModelV4 {
  const kelontong = openAICompatible(
    KELONTONG_BASE_URL,
    process.env.KELONTONG_API_KEY
  );
  const zai = openAICompatible(ZAI_BASE_URL, process.env.ZAI_API_KEY);
  const mistral = openAICompatible(
    MISTRAL_BASE_URL,
    process.env.MISTRAL_API_KEY
  );

  return withFallback(
    kelontong.chat("glm-5.2"),
    withFallback(zai.chat("glm-4.7-flash"), mistral.chat("mistral-small-latest"))
  );
}
