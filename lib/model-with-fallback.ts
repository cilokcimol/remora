import { APICallError } from "ai";
import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
} from "@ai-sdk/provider";

function isTransient(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    return (
      error.statusCode === 429 ||
      (error.statusCode != null && error.statusCode >= 500)
    );
  }
  return false;
}

/**
 * Tries the primary model; on transient provider errors (429 / 5xx)
 * transparently delegates the call to the fallback model.
 *
 * Used as Z.AI primary + Mistral backup so the demo stays alive when the
 * free tier is saturated. Memory middleware wraps this, so recall/save
 * behavior is identical regardless of which model answers.
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
        if (isTransient(error)) return fallback.doGenerate(options);
        throw error;
      }
    },
    async doStream(options: LanguageModelV4CallOptions) {
      try {
        return await primary.doStream(options);
      } catch (error) {
        if (isTransient(error)) return fallback.doStream(options);
        throw error;
      }
    },
  };
}
