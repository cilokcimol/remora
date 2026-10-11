import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
} from "@ai-sdk/provider";

/**
 * Falls back on any primary failure. For a chat product, answering via
 * the backup provider is always better than surfacing an error, and a
 * malformed request would fail on every provider anyway, so the real
 * error still surfaces after the last provider is tried.
 */
function shouldFallback(_error: unknown): boolean {
  return true;
}

/**
 * Tries the primary model; on any primary failure transparently
 * delegates the call to the fallback model.
 *
 * Chain: KelontongAI primary, then Z.AI, then Mistral, so the demo
 * stays alive when any single provider is saturated or down. Memory
 * middleware wraps this, so recall/save behavior is identical
 * regardless of which model answers.
 */
export function withFallback(
  primary: LanguageModelV4,
  fallback: LanguageModelV4
): LanguageModelV4 {
  return {
    specificationVersion: "v4",
    provider: `${primary.provider}+fallback`,
    modelId: primary.modelId,
    supportedUrls: primary.supportedUrls,
    async doGenerate(options: LanguageModelV4CallOptions) {
      try {
        return await primary.doGenerate(options);
      } catch (error) {
        if (shouldFallback(error)) return fallback.doGenerate(options);
        throw error;
      }
    },
    async doStream(options: LanguageModelV4CallOptions) {
      try {
        return await primary.doStream(options);
      } catch (error) {
        if (shouldFallback(error)) return fallback.doStream(options);
        throw error;
      }
    },
  };
}
