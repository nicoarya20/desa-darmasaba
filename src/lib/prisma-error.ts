import { Prisma } from "@prisma/client";

/**
 * Terjemahkan error unique-violation Prisma (P2002) menjadi response 409 yang
 * seragam & ramah untuk semua handler admin, tanpa mengubah schema.
 *
 * Keputusan pesan (lihat .DISKUSI/2026-07-15/notif-duplikat-admin.md):
 * gaya B — hanya sebut NAMA FIELD, tanpa nilai input. Ringkas + aman PII
 * (rule 12: jangan tampilkan/log PII seperti NIK/email).
 */

// Label ramah per field unik yang dipakai di form admin. Fallback: nama mentah.
const FIELD_LABELS: Record<string, string> = {
  month: "Bulan",
  year: "Tahun",
  tahun: "Tahun",
  name: "Nama",
  nama: "Nama",
  nik: "NIK",
  email: "Email",
  telepon: "Nomor telepon",
  nomor: "Nomor",
  key: "Key",
};

export function fieldLabel(field?: string): string {
  if (!field) return "Data";
  return FIELD_LABELS[field] ?? field;
}

/**
 * Ambil nama field dari `error.meta.target`.
 * - MySQL/beberapa versi: array nama kolom → pakai elemen pertama.
 * - PostgreSQL: string nama constraint (mis. "Model_month_year_key") →
 *   cari token field yang dikenal di dalamnya.
 */
export function extractDuplicateField(target: unknown): string | undefined {
  if (Array.isArray(target) && target.length > 0) {
    return String(target[0]);
  }
  if (typeof target === "string") {
    // Postgres: "<Table>_<col1>_<col2>_key". Pecah per segmen dan buang suffix
    // "key"/"unique" agar tidak false-match dgn field bernama sama.
    const segments = target
      .split("_")
      .map((s) => s.toLowerCase())
      .filter((s) => s !== "key" && s !== "unique");
    const known = new Set(Object.keys(FIELD_LABELS));
    for (const seg of segments) {
      if (known.has(seg)) return seg;
    }
  }
  return undefined;
}

export type DuplicateResponse = { success: false; message: string };

/**
 * Jika `error` adalah unique-violation Prisma (P2002), kembalikan response
 * duplikat seragam. Jika bukan, kembalikan null (caller yang menentukan).
 */
export function toDuplicateResponse(error: unknown): DuplicateResponse | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const field = extractDuplicateField(error.meta?.target);
    return {
      success: false,
      message: `${fieldLabel(field)} sudah dipakai`,
    };
  }
  return null;
}

// Elysia context minimal yang dibutuhkan untuk set status.
type StatusContext = { set: { status: number | string } };

/**
 * Helper siap-pakai di dalam catch handler create/edit:
 *
 *   try { return await prisma.model.create(...) }
 *   catch (e) { return handlePrismaError(e, context) }
 *
 * - P2002 → set status 409 (jika context ada) + return response duplikat.
 * - Selain itu → re-throw agar penanganan error yang ada tidak berubah.
 */
export function handlePrismaError(
  error: unknown,
  context?: StatusContext
): DuplicateResponse {
  const duplicate = toDuplicateResponse(error);
  if (duplicate) {
    if (context) context.set.status = 409;
    return duplicate;
  }
  throw error;
}
