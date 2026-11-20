import { z } from "zod";
import { phoneDigits, phoneInfo } from "@/app/(public)/_com/kontak-darurat/kontak-phone.logic";

// Aturan Kontak Desa (kantor, alamat, telepon, email, WhatsApp dan jam layanan opsional): konstanta, tipe, dan validasi murni tanpa I/O, dipakai bersama
// oleh API (Elysia), form admin Profil Desa > Kontak Desa, dan pembaca publik (footer, PPID).

/** ID tetap baris singleton KontakDesa (upsert atomik, tak mungkin ada baris ganda). Sama dengan id di migrasi awal. */
export const KONTAK_DESA_ID = "kontak-desa";

export const NAMA_KANTOR_MAX_LENGTH = 150;
export const ALAMAT_MAX_LENGTH = 300;
/** Panjang teks telepon sebagaimana diketik admin (termasuk spasi, kurung, tanda hubung). */
export const TELEPON_MAX_LENGTH = 40;
/** Panjang teks nomor WhatsApp sebagaimana diketik admin; sama dengan telepon. */
export const WHATSAPP_MAX_LENGTH = TELEPON_MAX_LENGTH;
/** Panjang teks jam layanan sebagaimana diketik admin, mis. "Senin–Jumat 07.30–15.30" (teks bebas). */
export const JAM_LAYANAN_MAX_LENGTH = 120;
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
  /** Opsional: null = desa belum memberi nomor WhatsApp (tidak ditampilkan di publik). */
  whatsapp: string | null;
  /** Opsional: null = jam layanan belum diisi (tidak ditampilkan di publik). */
  jamLayanan: string | null;
  updatedAt: string;
};

/** Isian form admin (tanpa id dan tanggal); WhatsApp dan jam layanan kosong ("") = belum diisi. */
export type KontakDesaFormValues = Pick<KontakDesaRecord, "namaKantor" | "alamat" | "telepon" | "email"> & {
  whatsapp: string;
  jamLayanan: string;
};

/** Apakah teks telepon nomor Indonesia yang dikenali (seluler atau telepon tetap, bukan nomor layanan pendek). */
export function isTeleponKontakValid(raw: string): boolean {
  if (!TELEPON_CHARS.test(raw) || phoneDigits(raw).length > TELEPON_MAX_DIGITS) return false;
  const kind = phoneInfo(raw)?.kind;
  return kind === "mobile" || kind === "landline";
}

/** Apakah teks nomor WhatsApp yang dikenali: harus seluler Indonesia (telepon tetap dan nomor layanan pendek tidak bisa WhatsApp). */
export function isWhatsappKontakValid(raw: string): boolean {
  if (!TELEPON_CHARS.test(raw) || phoneDigits(raw).length > TELEPON_MAX_DIGITS) return false;
  return phoneInfo(raw)?.kind === "mobile";
}

/** Teks wajib: spasi berulang dirapikan, tidak boleh kosong, dan maksimal `max` karakter (dipakai juga oleh Tim Pengelola). */
export const requiredText = (label: string, max: number) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa teks` })
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .pipe(
      z.string().min(1, `${label} wajib diisi`).max(max, `${label} maksimal ${max} karakter`),
    );

/**
 * WhatsApp opsional: tidak dikirim, null, atau kosong = null (tidak ada nomor); bila diisi harus nomor seluler.
 * Bukan requiredText karena desa belum memberi nomor dan admin boleh mengosongkannya kembali.
 */
const optionalWhatsapp = z
  .string({ invalid_type_error: "WhatsApp harus berupa teks" })
  .nullish()
  .transform((value) => (value ?? "").replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .max(WHATSAPP_MAX_LENGTH, `WhatsApp maksimal ${WHATSAPP_MAX_LENGTH} karakter`)
      .refine(
        (value) => value === "" || isWhatsappKontakValid(value),
        "WhatsApp tidak valid: isi nomor seluler Indonesia, mis. 0812 3456 7890, atau kosongkan bila belum ada",
      ),
  )
  .transform((value) => (value === "" ? null : value));

/**
 * Jam layanan opsional (teks bebas): tidak dikirim, null, atau kosong = null; bila diisi, spasi berulang dirapikan dan
 * panjangnya dibatasi. Format jam sengaja tidak diparse karena desa menuliskannya bebas (mis. beda jam per hari).
 */
const optionalJamLayanan = z
  .string({ invalid_type_error: "Jam layanan harus berupa teks" })
  .nullish()
  .transform((value) => (value ?? "").replace(/\s+/g, " ").trim())
  .pipe(z.string().max(JAM_LAYANAN_MAX_LENGTH, `Jam layanan maksimal ${JAM_LAYANAN_MAX_LENGTH} karakter`))
  .transform((value) => (value === "" ? null : value));

/** Skema input upsert Kontak Desa (dipakai API dan form admin); kunci di luar field berikut dibuang. */
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
  whatsapp: optionalWhatsapp,
  jamLayanan: optionalJamLayanan,
});

export type KontakDesaInput = z.output<typeof kontakDesaSchema>;

export type KontakDesaParseResult = { ok: true; data: KontakDesaInput } | { ok: false; message: string };

/** Validasi body mentah; pesan galat = isu pertama (konsisten untuk toast dan respons 400). */
export function parseKontakDesaInput(body: unknown): KontakDesaParseResult {
  const result = kontakDesaSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, message: result.error.issues[0]?.message ?? "Data tidak valid" };
}
