import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export const maxDuration = 60;

const zai = createOpenAI({
  baseURL: "https://api.z.ai/api/paas/v4",
  apiKey: process.env.ZAI_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { messages, userId }: { messages: UIMessage[]; userId?: string } =
    await req.json();

  // Per-visitor memory namespace: the same browser keeps its memories
  // across sessions; different visitors never see each other's memories.
  const safeId = (userId ?? "anon").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) || "anon";
  const namespace = `remora-${safeId}`;

  const model = withMemWal(zai("glm-4.7-flash"), {
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
  });

  return result.toUIMessageStreamResponse();
}
