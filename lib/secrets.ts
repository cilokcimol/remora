/**
 * Client side encryption for the /incognito secret vault.
 *
 * Secrets are encrypted in the browser with a key derived from the user's
 * own password (PBKDF2, 210k iterations, AES-GCM 256) before anything
 * leaves the device. The server only ever sees ciphertext, so even the
 * chatbot operator cannot read stored secrets. The password itself is
 * never sent anywhere and lives only in the page's memory.
 *
 * Isomorphic: uses globalThis.crypto, available in browsers and Node 20+.
 */

export interface SecretPayload {
  label: string;
  iv: string;
  salt: string;
  data: string;
}

const PBKDF2_ITERATIONS = 210000;
const LABEL_PATTERN = /^[a-zA-Z0-9-]{1,40}$/;

export function isValidLabel(label: string): boolean {
  return LABEL_PATTERN.test(label);
}

function b64encode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64decode(s: string): Uint8Array {
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const base = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return globalThis.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypts a secret. Returns the payload that is safe to store server side. */
export async function encryptSecret(
  password: string,
  label: string,
  plaintext: string
): Promise<SecretPayload> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext)
  );
  return {
    label,
    iv: b64encode(iv),
    salt: b64encode(salt),
    data: b64encode(new Uint8Array(ciphertext)),
  };
}

/** Decrypts a stored payload. Throws when the password is wrong. */
export async function decryptSecret(
  password: string,
  payload: SecretPayload
): Promise<string> {
  const key = await deriveKey(password, b64decode(payload.salt));
  const plaintext = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64decode(payload.iv) as BufferSource },
    key,
    b64decode(payload.data) as BufferSource
  );
  return new TextDecoder().decode(plaintext);
}
