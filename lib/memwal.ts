import { MemWal } from "@mysten-incubation/memwal";
import type { WithMemWalOptions } from "@mysten-incubation/memwal/ai";

const RELAYER_URL = "https://relayer.memory.walrus.xyz";
const MAX_USER_ID_LENGTH = 64;
const VAULT_LIST_LIMIT = 50;

/** Broad semantic query used to surface everything stored for a visitor. */
const VAULT_QUERY = "everything known about this person, all stored facts";

export interface StoredMemory {
  blobId: string;
  text: string;
  createdAt: string | null;
}

/**
 * Normalizes a client supplied user id into a safe namespace segment.
 * Falls back to "anon" when nothing usable is provided.
 */
export function sanitizeUserId(raw: unknown): string {
  const cleaned =
    typeof raw === "string"
      ? raw.replace(/[^a-zA-Z0-9-]/g, "").slice(0, MAX_USER_ID_LENGTH)
      : "";
  return cleaned || "anon";
}

/**
 * Memory namespace for one visitor. The same browser keeps its memories
 * across sessions. Different visitors never see each other's memories.
 */
export function namespaceFor(userId: string): string {
  return `remora-${userId}`;
}

function serverConfig() {
  return {
    key: process.env.MEMWAL_PRIVATE_KEY ?? "",
    accountId: process.env.MEMWAL_ACCOUNT_ID ?? "",
    serverUrl: process.env.MEMWAL_SERVER_URL ?? RELAYER_URL,
  };
}

/** Options for the withMemWal chat middleware. */
export function memwalOptions(namespace: string): WithMemWalOptions {
  return {
    ...serverConfig(),
    namespace,
    maxMemories: 5,
    autoSave: true,
    minRelevance: 0.3,
  };
}

/**
 * Lists the memories stored for one namespace, newest write first when
 * the relayer reports write times. The SDK exposes no list endpoint, so
 * this runs a broad semantic recall and returns the top matches.
 */
export async function listMemories(
  namespace: string
): Promise<StoredMemory[]> {
  const client = MemWal.create({ ...serverConfig(), namespace });
  try {
    const result = await client.recall({
      query: VAULT_QUERY,
      limit: VAULT_LIST_LIMIT,
      namespace,
    });
    const memories = result.results.map((m) => ({
      blobId: m.blob_id,
      text: m.text,
      createdAt: m.created_at ?? null,
    }));
    memories.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return memories;
  } finally {
    client.destroy();
  }
}
