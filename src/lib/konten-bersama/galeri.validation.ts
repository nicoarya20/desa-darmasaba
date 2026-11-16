import { z } from "zod";
import { skemaUrutan, imageIdWajib, teksOpsional } from "./daftar-anak.validation";
import { idListUnik } from "./urutan.logic";

/** Batas keterangan foto galeri default (sama untuk semua domain kecuali dikonfigurasi lain). */
export const MAX_KETERANGAN_FOTO_GALERI = 500;

/**
 * Skema body galeri foto satu domain: `create` (POST daftar foto terunggah), `update` (PUT keterangan),
 * `reorder` (PUT urutan). `max` = batas jumlah foto galeri domain itu.
 */
export function buatSkemaGaleri({ max, maxKeterangan = MAX_KETERANGAN_FOTO_GALERI }: { max: number; maxKeterangan?: number }) {
  const keterangan = teksOpsional({ label: "Keterangan", max: maxKeterangan });
  return {
    create: z.object({
      items: z
        .array(z.object({ imageId: imageIdWajib, keterangan }))
        .min(1, "Pilih minimal satu foto")
        .max(max, `Maksimal ${max} foto sekaligus`)
        .refine((items) => idListUnik(items.map((i) => i.imageId)), "Gambar yang sama dikirim lebih dari sekali"),
    }),
    update: z.object({ keterangan }),
    reorder: skemaUrutan({ label: "foto", max }),
  };
}
