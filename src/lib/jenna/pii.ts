// Penyamaran PII pada teks chat Jenna: NIK/KK, nomor telepon Indonesia, email. Dipakai untuk pesan
// pengunjung (sebelum ke provider & DB) dan jawaban asisten (lewat output guard, dengan pengecualian).

export type PiiKind = "nik" | "phone" | "email";

export const PII_MASKS: Record<PiiKind, string> = {
  nik: "[NIK disamarkan]",
  phone: "[nomor disamarkan]",
  email: "[email disamarkan]",
};

// 16 digit, boleh dipisah spasi/titik. Tidak diawali angka/titik/koma agar nominal "Rp 1.234…" tidak kena.
const NIK = /(?<![\w.,])\d(?:[ .]?\d){15}(?!\d)/g;
// Awalan 0 / 62 / +62 diikuti kelompok ≥2 digit (menyaring jam "07.30" & tanggal "05-11-2026"); total 9–13 digit.
const PHONE = /(?<![\w+.,/-])\(?(?:\+62[ .-]?|62|0)\(?\d{2,}\)?(?:[ .-]?\d+)*/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 13;

/** Bentuk pembanding: digit saja (awalan 62 → 0) atau email huruf kecil. */
export function normalizePii(kind: PiiKind, raw: string): string {
  if (kind === "email") return raw.toLowerCase();
  const digits = raw.replace(/\D/g, "");
  return kind === "phone" && digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
}

const isPhoneLength = (raw: string) => {
  const count = raw.replace(/\D/g, "").length;
  return count >= PHONE_MIN_DIGITS && count <= PHONE_MAX_DIGITS;
};

/** `keep` = true → nilai dibiarkan apa adanya (mis. kontak organisasi yang tercantum di data publik). */
export type PiiKeep = (kind: PiiKind, normalized: string) => boolean;

export function maskPii(text: string, keep?: PiiKeep): string {
  const replace = (kind: PiiKind) => (match: string) =>
    keep?.(kind, normalizePii(kind, match)) ? match : PII_MASKS[kind];
  return text
    .replace(NIK, replace("nik"))
    .replace(PHONE, (match) => (isPhoneLength(match) ? replace("phone")(match) : match))
    .replace(EMAIL, replace("email"));
}

/** Semua nilai PII (ter-normalisasi, `kind:value`) di teks — dasar pengecualian output guard. */
export function collectPiiValues(texts: readonly string[]): Set<string> {
  const found = new Set<string>();
  for (const text of texts) {
    for (const m of text.matchAll(NIK)) found.add(`nik:${normalizePii("nik", m[0])}`);
    for (const m of text.matchAll(PHONE)) {
      if (isPhoneLength(m[0])) found.add(`phone:${normalizePii("phone", m[0])}`);
    }
    for (const m of text.matchAll(EMAIL)) found.add(`email:${normalizePii("email", m[0])}`);
  }
  return found;
}
