import { Prisma } from "@prisma/client";
import type { MediaSosialItem } from "@/lib/konten-bersama/media-sosial.model";

/**
 * Kolom `mediaSosial` untuk data Prisma dari body tervalidasi: tidak dikirim → kolom tidak diubah,
 * daftar kosong/null → NULL (bukan `[]`, agar "tidak punya media sosial" punya satu bentuk di DB).
 */
export function kolomMediaSosial(value: readonly MediaSosialItem[] | null | undefined) {
  if (value === undefined) return {};
  return { mediaSosial: value?.length ? [...value] : Prisma.DbNull };
}
