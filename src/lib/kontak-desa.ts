import { z } from "zod";
import { phoneDigits, phoneInfo } from "@/app/(public)/_com/kontak-darurat/kontak-phone.logic";

// Aturan Kontak Desa (kantor, alamat, telepon, email): konstanta, tipe, dan validasi murni tanpa I/O, dipakai bersama
// oleh API (Elysia), form admin Profil Desa > Kontak Desa, dan pembaca publik (footer, PPID).

/** ID tetap baris singleton KontakDesa (upsert atomik, tak mungkin ada baris ganda). Sama dengan id di migrasi awal. */
export const KONTAK_DESA_ID = "kontak-desa";

export const NAMA_KANTOR_MAX_LENGTH = 150;
export const ALAMAT_MAX_LENGTH = 300;
/** Panjang teks telepon sebagaimana diketik admin (termasuk spasi, kurung, tanda hubung). */
export const TELEPON_MAX_LENGTH = 40;
/** Batas digit nomor telepon internasional (E.164). */
export const TELEPON_MAX_DIGITS = 15;
/** Batas alamat email menurut RFC 5321. */
export const EMAIL_MAX_LENGTH = 254;

/** Teks telepon hanya boleh angka, spasi, dan tanda baca nomor: ( ) + - . */
const TELEPON_CHARS = /^[\d\s()+.-]+$/;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kontak desa seperti dikirim API (tanggal dalam ISO string). */
export type KontakDesaRecord = {
  id: string;
  namaKantor: string;
  alamat: string;
  telepon: string;
  email: string;
  updatedAt: string;
};

/** Isian form admin (tanpa id dan tanggal). */
export type KontakDesaFormValues = Pick<KontakDesaRecord, "namaKantor" | "alamat" | "telepon" | "email">;

/** Apakah teks telepon nomor Indonesia yang dikenali (seluler atau telepon tetap, bukan nomor layanan pendek). */
export function isTeleponKontakValid(raw: string): boolean {
  if (!TELEPON_CHARS.test(raw) || phoneDigits(raw).length > TELEPON_MAX_DIGITS) return false;
  const kind = phoneInfo(raw)?.kind;
  return kind === "mobile" || kind === "landline";
}

/** Teks wajib: spasi berulang dirapikan, tidak boleh kosong, dan maksimal `max` karakter. */
const requiredText = (label: string, max: number) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa teks` })
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .pipe(
      z.string().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`),
    );

/** Skema input upsert Kontak Desa (dipakai API dan form admin); kunci di luar empat field dibuang. */
export const kontakDesaSchema = z.object({
  namaKantor: requiredText("Nama kantor", NAMA_KANTOR_MAX_LENGTH),
  alamat: requiredText("Alamat", ALAMAT_MAX_LENGTH),
  telepon: requiredText("Telepon", TELEPON_MAX_LENGTH).refine(
    isTeleponKontakValid,
    "Telepon tidak valid: isi nomor telepon tetap atau seluler Indonesia, mis. (0361) 8441518",
  ),
  email: requiredText("Email", EMAIL_MAX_LENGTH).refine(
    (value) => EMAIL_FORMAT.test(value),
    "Format email tidak valid, mis. nama@desa.id",
  ),
});

export type KontakDesaInput = z.output<typeof kontakDesaSchema>;

export type KontakDesaParseResult = { ok: true; data: KontakDesaInput } | { ok: false; message: string };

/** Validasi body mentah; pesan galat = isu pertama (konsisten untuk toast dan respons 400). */
export function parseKontakDesaInput(body: unknown): KontakDesaParseResult {
  const result = kontakDesaSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, message: result.error.issues[0]?.message ?? "Data tidak valid" };
}
