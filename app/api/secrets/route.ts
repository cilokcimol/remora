import { isValidLabel, type SecretPayload } from "@/lib/secrets";
import {
  recallFromNamespace,
  rememberAndWait,
  sanitizeUserId,
  secretsNamespaceFor,
} from "@/lib/memwal";

const LIST_LIMIT = 50;
const MAX_FIELD_CHARS = 20000;

function isPayload(value: unknown): value is SecretPayload {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.label === "string" &&
    isValidLabel(p.label) &&
    typeof p.iv === "string" &&
    typeof p.salt === "string" &&
    typeof p.data === "string" &&
    p.iv.length <= MAX_FIELD_CHARS &&
    p.salt.length <= MAX_FIELD_CHARS &&
    p.data.length <= MAX_FIELD_CHARS
  );
}

/**
 * Lists the encrypted secret payloads for one visitor. The server only
 * ever sees ciphertext: decryption happens in the browser with the
 * visitor's own password.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const namespace = secretsNamespaceFor(sanitizeUserId(searchParams.get("userId")));

  try {
    const memories = await recallFromNamespace(namespace, "encrypted secrets", LIST_LIMIT);
    const secrets: SecretPayload[] = [];
    for (const m of memories) {
      try {
        const parsed: unknown = JSON.parse(m.text);
        if (isPayload(parsed)) secrets.push(parsed);
      } catch {
        // Not a secret payload, ignore.
      }
    }
    return Response.json({ secrets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message.slice(0, 300) }, { status: 500 });
  }
}

/**
 * Stores one encrypted secret payload. The plaintext never reaches this
 * endpoint: the client encrypts before sending.
 */
export async function POST(req: Request) {
  const body: unknown = await req.json();
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }
  const { userId, ...payload } = body as Record<string, unknown>;
  if (!isPayload(payload)) {
    return Response.json({ error: "Invalid secret payload." }, { status: 400 });
  }

  const namespace = secretsNamespaceFor(sanitizeUserId(userId));

  try {
    await rememberAndWait(JSON.stringify(payload), namespace);
    return Response.json({ ok: true, label: payload.label });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message.slice(0, 300) }, { status: 500 });
  }
}
