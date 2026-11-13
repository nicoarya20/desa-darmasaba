import { z } from "zod";

/**
 * Batas jumlah foto galeri Profil BUMDes. Galeri ditampilkan utuh di satu section publik,
 * jadi jumlahnya dibatasi di sini (bukan dipaginasi) agar list tetap ringan.
 */
export const MAX_FOTO_GALERI = 50;
export const MAX_KETERANGAN_FOTO = 500;

/** Keterangan foto opsional: kosong/spasi → null. */
const keteranganSchema = z
  .string({ invalid_type_error: "Keterangan harus berupa teks" })
  .trim()
  .max(MAX_KETERANGAN_FOTO, `Keterangan maksimal ${MAX_KETERANGAN_FOTO} karakter`)
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

const idListUnik = (ids: readonly string[]) => new Set(ids).size === ids.length;

/** Skema body POST galeri: daftar foto yang sudah diunggah ke FileStorage. */
export const fotoProfilCreateSchema = z.object({
  items: z
    .array(
      z.object({
        imageId: z
          .string({ required_error: "ID gambar wajib diisi" })
          .trim()
          .min(1, "ID gambar wajib diisi"),
        keterangan: keteranganSchema,
      }),
    )
    .min(1, "Pilih minimal satu foto")
    .max(MAX_FOTO_GALERI, `Maksimal ${MAX_FOTO_GALERI} foto sekaligus`)
    .refine((items) => idListUnik(items.map((i) => i.imageId)), "Gambar yang sama dikirim lebih dari sekali"),
});

/** Skema body PUT keterangan satu foto; null/"" menghapus keterangan. */
export const fotoProfilUpdateSchema = z.object({ keterangan: keteranganSchema });

/** Skema body PUT urutan: seluruh id foto galeri aktif, urut dari atas ke bawah. */
export const fotoProfilReorderSchema = z.object({
  ids: z
    .array(z.string().trim().min(1, "ID foto tidak boleh kosong"))
    .min(1, "Daftar urutan foto kosong")
    .max(MAX_FOTO_GALERI, `Maksimal ${MAX_FOTO_GALERI} foto`)
    .refine(idListUnik, "ID foto dikirim lebih dari sekali"),
});

export type FotoProfilCreateInput = z.infer<typeof fotoProfilCreateSchema>;
