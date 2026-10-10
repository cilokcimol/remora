import { listMemories, namespaceFor, sanitizeUserId } from "@/lib/memwal";

/**
 * Returns the Walrus memories stored for one visitor.
 * Powers the Memory Vault page: proof that memory is real, inspectable,
 * and scoped to the visitor who created it.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const namespace = namespaceFor(sanitizeUserId(searchParams.get("userId")));

  try {
    const memories = await listMemories(namespace);
    return Response.json({ memories, count: memories.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: message.slice(0, 300) },
      { status: 500 }
    );
  }
}
