import { z } from "zod";
import { idListUnik } from "./urutan.logic";

/** Skema body PUT urutan daftar anak: seluruh id item aktif, urut dari atas ke bawah. `label` mis. "foto". */
export function skemaUrutan({ label, max }: { label: string; max: number }) {
  return z.object({
    ids: z
      .array(z.string().trim().min(1, `ID ${label} tidak boleh kosong`))
      .min(1, `Daftar urutan ${label} kosong`)
      .max(max, `Maksimal ${max} ${label}`)
      .refine(idListUnik, `ID ${label} dikirim lebih dari sekali`),
  });
}

/** Teks opsional: kosong/spasi → null, melebihi `max` ditolak dengan pesan berlabel. */
export function teksOpsional({ label, max }: { label: string; max: number }) {
  return z
    .string({ invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));
}

/** ID berkas FileStorage wajib (gambar yang sudah diunggah). */
export const imageIdWajib = z
  .string({ required_error: "ID gambar wajib diisi" })
  .trim()
  .min(1, "ID gambar wajib diisi");
