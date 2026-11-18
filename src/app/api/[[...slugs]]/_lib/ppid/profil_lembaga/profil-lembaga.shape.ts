import { htmlToPlainText } from "@/lib/rich-text";
import { sanitizeRichTextForStorage } from "@/lib/rich-text-server";
import type { Prisma } from "@prisma/client";

/** Batas panjang HTML satu bagian teks profil lembaga (karakter); mencegah kiriman berukuran tak wajar. */
export const PROFIL_LEMBAGA_MAX_TEXT = 50_000;

/** Pesan galat saat pemanggil bukan admin. */
export const PESAN_PROFIL_LEMBAGA_BUKAN_ADMIN = "Hanya admin yang boleh mengubah profil lembaga PPID";

/** Bentuk body PUT: bagian yang tidak dikirim (undefined) dibiarkan; null atau teks kosong mengosongkan bagian itu. */
export type ProfilLembagaBody = {
  deskripsi?: string | null;
  tujuan?: string | null;
  tugasFungsi?: string | null;
  gambarAlurId?: string | null;
};

/** Sanitasi satu bagian teks untuk disimpan; HTML tanpa isi teks (mis. "<p></p>") menjadi null, undefined tetap undefined. */
export function cleanProfilLembagaText(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) return value;
  const bersih = sanitizeRichTextForStorage(value);
  return htmlToPlainText(bersih) === "" ? null : bersih;
}

/** Data tulis Prisma (create sekaligus update; semua kolom opsional) dari body: hanya bagian yang dikirim, teks tersanitasi, id gambar kosong menjadi null (lepas gambar). */
export function toProfilLembagaData(body: ProfilLembagaBody): Prisma.ProfilLembagaPPIDUncheckedCreateInput {
  const data: Prisma.ProfilLembagaPPIDUncheckedCreateInput = {};
  if (body.deskripsi !== undefined) data.deskripsi = cleanProfilLembagaText(body.deskripsi);
  if (body.tujuan !== undefined) data.tujuan = cleanProfilLembagaText(body.tujuan);
  if (body.tugasFungsi !== undefined) data.tugasFungsi = cleanProfilLembagaText(body.tugasFungsi);
  if (body.gambarAlurId !== undefined) data.gambarAlurId = body.gambarAlurId || null;
  return data;
}
