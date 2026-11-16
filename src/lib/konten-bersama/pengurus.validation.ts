import { z } from "zod";
import { skemaUrutan } from "./daftar-anak.validation";

/** Batas panjang nama & jabatan pengurus. */
export const MAX_TEKS_PENGURUS = 150;

const teksWajib = (label: string) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(MAX_TEKS_PENGURUS, `${label} maksimal ${MAX_TEKS_PENGURUS} karakter`);

// Foto pengurus opsional: "" / null → null.
const imageIdOpsional = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v === undefined ? undefined : v || null));

/**
 * Skema body struktur pengurus satu domain: `create` (POST daftar pengurus), `update` (PUT sebagian field;
 * field yang tidak dikirim tetap), `reorder` (PUT urutan). `max` = batas jumlah pengurus.
 */
export function buatSkemaPengurus({ max }: { max: number }) {
  const pengurus = z.object({ nama: teksWajib("Nama"), jabatan: teksWajib("Jabatan"), imageId: imageIdOpsional });
  return {
    create: z.object({
      items: z.array(pengurus).min(1, "Isi minimal satu pengurus").max(max, `Maksimal ${max} pengurus sekaligus`),
    }),
    update: pengurus.partial(),
    reorder: skemaUrutan({ label: "pengurus", max }),
  };
}
