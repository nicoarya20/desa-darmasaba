import { z } from "zod";
import { requiredText } from "@/lib/kontak-desa";

// Aturan Tim Pengelola Website Desa (juknis lomba 2027 butir 8.3): nomor/tanggal SK, berkas PDF SK, dan daftar anggota
// berurutan. Konstanta, tipe, dan validasi murni tanpa I/O; dipakai bersama oleh API (Elysia), form admin Profil Desa >
// Tim Redaksi, dan pembaca publik (footer, yang hanya menerima nomor SK + tautan PDF, tanpa anggota).

/** ID tetap baris singleton TimPengelolaWebsite (upsert atomik, tak mungkin ada baris ganda). */
export const TIM_PENGELOLA_ID = "tim-pengelola-website";

export const NOMOR_SK_MAX_LENGTH = 100;
export const NAMA_ANGGOTA_MAX_LENGTH = 100;
export const JABATAN_ANGGOTA_MAX_LENGTH = 100;
/** Batas jumlah anggota satu SK (pengaman form dan API; SK desa lazimnya belasan orang). */
export const ANGGOTA_TIM_MAX = 30;
/** Rentang tahun tanggal SK yang dianggap wajar (menangkap salah ketik seperti 0026 atau 20260). */
export const TAHUN_SK_MIN = 2000;
export const TAHUN_SK_MAX = 2100;

const TANGGAL_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** Berkas PDF SK seperti dikirim API (tanpa path internal). */
export type TimPengelolaFileRef = { id: string; link: string; realName: string };

/** Satu anggota tim: nama dan jabatan (teks bebas, mis. "Ketua", "Administrator Website"). */
export type AnggotaTimPengelola = { nama: string; jabatan: string };

/** Data tim seperti dikirim API publik: tanpa anggota (tanggal dalam ISO string, `skFile` null = PDF belum diunggah). */
export type TimPengelolaPublicRecord = {
  id: string;
  nomorSk: string;
  tanggalSk: string | null;
  skFile: TimPengelolaFileRef | null;
  updatedAt: string;
};

/** Data tim seperti dikirim API admin: sama dengan publik + daftar anggota berurutan. */
export type TimPengelolaAdminRecord = TimPengelolaPublicRecord & { anggota: AnggotaTimPengelola[] };

/** Isian form admin; tanggal kosong ("") = belum diisi. Berkas SK diunggah terpisah dan dikirim lewat `skFileId`. */
export type TimPengelolaFormValues = {
  nomorSk: string;
  tanggalSk: string;
  anggota: AnggotaTimPengelola[];
};

/** Apakah teks berupa tanggal kalender nyata berformat TTTT-BB-HH dalam rentang tahun wajar. */
export function isTanggalSkValid(raw: string): boolean {
  if (!TANGGAL_FORMAT.test(raw)) return false;
  const tahun = Number(raw.slice(0, 4));
  if (tahun < TAHUN_SK_MIN || tahun > TAHUN_SK_MAX) return false;
  const date = new Date(`${raw}T00:00:00.000Z`);
  // Tanggal mustahil (30 Februari → 2 Maret) tertangkap karena hasil format ulang berbeda dari masukan.
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === raw;
}

/** Tanggal TTTT-BB-HH (sudah divalidasi) menjadi Date tengah malam UTC untuk kolom DATE; null tetap null. */
export function toTanggalSkDate(tanggal: string | null): Date | null {
  return tanggal ? new Date(`${tanggal}T00:00:00.000Z`) : null;
}

/** Tanggal opsional: tidak dikirim, null, atau kosong = null; bila diisi harus tanggal nyata TTTT-BB-HH. */
const optionalTanggalSk = z
  .string({ invalid_type_error: "Tanggal SK harus berupa teks" })
  .nullish()
  .transform((value) => (value ?? "").trim())
  .pipe(
    z.string().refine(
      (value) => value === "" || isTanggalSkValid(value),
      `Tanggal SK tidak valid: gunakan format TTTT-BB-HH dengan tahun ${TAHUN_SK_MIN}-${TAHUN_SK_MAX}, mis. 2026-01-12`,
    ),
  )
  .transform((value) => (value === "" ? null : value));

const anggotaSchema = z.object({
  nama: requiredText("Nama", NAMA_ANGGOTA_MAX_LENGTH),
  jabatan: requiredText("Jabatan", JABATAN_ANGGOTA_MAX_LENGTH),
});

/**
 * Skema input upsert Tim Pengelola (dipakai API dan form admin). `anggota` wajib berupa daftar (boleh kosong) supaya
 * permintaan tanpa daftar tidak diam-diam menghapus anggota. `skFileId`: tidak dikirim = berkas tetap, null = lepas
 * berkas, id = ganti berkas. Kunci di luar field berikut dibuang.
 */
export const timPengelolaSchema = z.object({
  nomorSk: requiredText("Nomor SK", NOMOR_SK_MAX_LENGTH),
  tanggalSk: optionalTanggalSk,
  skFileId: z.string({ invalid_type_error: "skFileId harus berupa teks" }).min(1, "skFileId tidak boleh kosong").nullish(),
  anggota: z
    .array(anggotaSchema, {
      required_error: "Daftar anggota wajib dikirim (boleh kosong)",
      invalid_type_error: "Daftar anggota harus berupa daftar",
    })
    .max(ANGGOTA_TIM_MAX, `Anggota maksimal ${ANGGOTA_TIM_MAX} orang`),
});

export type TimPengelolaInput = z.output<typeof timPengelolaSchema>;

export type TimPengelolaParseResult = { ok: true; data: TimPengelolaInput } | { ok: false; message: string };

/** Validasi body mentah; pesan galat = isu pertama, dengan nomor urut anggota bila galatnya ada di daftar anggota. */
export function parseTimPengelolaInput(body: unknown): TimPengelolaParseResult {
  const result = timPengelolaSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  const issue = result.error.issues[0];
  if (!issue) return { ok: false, message: "Data tidak valid" };
  const [kunci, indeks] = issue.path;
  const awalan = kunci === "anggota" && typeof indeks === "number" ? `Anggota ke-${indeks + 1}: ` : "";
  return { ok: false, message: `${awalan}${issue.message}` };
}
