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
 * Semantic recall scoped to one namespace. Every read in the app goes
 * through here, so a visitor can only ever see their own namespace.
 * Cross visitor reads are impossible by construction: recall takes
 * exactly one namespace and the caller always passes the visitor's own.
 */
export async function recallFromNamespace(
  namespace: string,
  query: string,
  limit: number
): Promise<StoredMemory[]> {
  const client = MemWal.create({ ...serverConfig(), namespace });
  try {
    const result = await client.recall({ query, limit, namespace });
    return result.results.map((m) => ({
      blobId: m.blob_id,
      text: m.text,
      createdAt: m.created_at ?? null,
    }));
  } finally {
    client.destroy();
  }
}

/**
 * Lists the memories stored for one namespace, newest write first when
 * the relayer reports write times. The SDK exposes no list endpoint, so
 * this runs a broad semantic recall and returns the top matches.
 */
export async function listMemories(
  namespace: string
): Promise<StoredMemory[]> {
  const memories = await recallFromNamespace(namespace, VAULT_QUERY, VAULT_LIST_LIMIT);
  memories.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return memories;
}

/**
 * Stores one text in a namespace and waits until the write lands.
 * Used for the opt in community tip pool and the encrypted secret vault.
 */
export async function rememberAndWait(
  text: string,
  namespace: string
): Promise<void> {
  const client = MemWal.create({ ...serverConfig(), namespace });
  try {
    const accepted = await client.rememberAsync(text, namespace);
    await client.waitForRememberJob(accepted.job_id, { timeoutMs: 90000 });
  } finally {
    client.destroy();
  }
}

/**
 * Namespace for the opt in community tip pool behind /share and /wisdom.
 * Only tips a visitor explicitly shares ever land here, already stripped
 * of identifying details. Private namespaces are never read for this.
 */
export const SHARED_TIPS_NAMESPACE = "remora-shared-tips";

/** Namespace for one visitor's client side encrypted secrets (/incognito). */
export function secretsNamespaceFor(userId: string): string {
  return `remora-${userId}-secrets`;
}
