// Enkripsi API key provider Jenna di DB: AES-256-GCM (node:crypto), format berversi
// `v1:<iv b64>:<tag b64>:<ciphertext b64>`. Fail-closed: kunci kosong/salah selalu melempar,
// tidak pernah jatuh ke plaintext. Kunci dioper sebagai argumen supaya fungsi murni & mudah dites.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_HEX_PATTERN = /^[0-9a-fA-F]{64}$/;

export const CREDENTIALS_KEY_ENV = "JENNA_CREDENTIALS_KEY";

export type SecretCryptoErrorCode = "KEY_MISSING" | "KEY_INVALID" | "BAD_FORMAT" | "DECRYPT_FAILED";

export class SecretCryptoError extends Error {
  constructor(
    readonly code: SecretCryptoErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SecretCryptoError";
  }
}

export function isCredentialsKeyValid(keyHex: string | null | undefined): boolean {
  return KEY_HEX_PATTERN.test(keyHex?.trim() ?? "");
}

function loadKey(keyHex: string | null | undefined): Buffer {
  const hex = keyHex?.trim();
  if (!hex) {
    throw new SecretCryptoError(
      "KEY_MISSING",
      `${CREDENTIALS_KEY_ENV} belum diset, API key tidak bisa dienkripsi atau didekripsi.`,
    );
  }
  if (!KEY_HEX_PATTERN.test(hex)) {
    throw new SecretCryptoError("KEY_INVALID", `${CREDENTIALS_KEY_ENV} harus 64 karakter hex (32 byte).`);
  }
  return Buffer.from(hex, "hex");
}

export function encryptSecret(plaintext: string, keyHex: string | null | undefined): string {
  const key = loadKey(keyHex);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decryptSecret(payload: string, keyHex: string | null | undefined): string {
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new SecretCryptoError("BAD_FORMAT", "Format API key terenkripsi tidak dikenal.");
  }
  const [, ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new SecretCryptoError("BAD_FORMAT", "API key terenkripsi terpotong atau rusak.");
  }

  const key = loadKey(keyHex);
  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new SecretCryptoError(
      "DECRYPT_FAILED",
      `Dekripsi gagal: kunci ${CREDENTIALS_KEY_ENV} berbeda atau data diubah.`,
    );
  }
}

/** 4 karakter terakhir API key untuk ditampilkan (`••••abcd`); null bila key terlalu pendek untuk dibocorkan sebagian. */
export function apiKeyHint(apiKey: string): string | null {
  const trimmed = apiKey.trim();
  return trimmed.length >= 12 ? trimmed.slice(-4) : null;
}
