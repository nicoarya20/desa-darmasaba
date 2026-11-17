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

/** ID berkas FileStorage wajib (gambar yang sudah diunggah). */
export const imageIdWajib = z
  .string({ required_error: "ID gambar wajib diisi" })
  .trim()
  .min(1, "ID gambar wajib diisi");

/** ID berkas FileStorage opsional: ""/null → null (dikosongkan), tidak dikirim → `undefined` (tidak diubah). */
export const imageIdOpsional = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v === undefined ? undefined : v || null));
