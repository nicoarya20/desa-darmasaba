import { z } from "zod";

/** ID tetap baris singleton profil BUMDes; menjamin upsert tidak pernah membuat baris kedua. */
export const PROFIL_BUMDES_ID = "profil-bumdes";

export const TAHUN_BERDIRI_MIN = 1900;
const MAX_NAMA = 255;
const MAX_KONTAK = 255;
const MAX_TEKS_PANJANG = 5000;

/** String opsional: kosong/spasi → null (menghapus nilai), undefined → tidak diubah. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter`)
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v));

/** Skema body PUT profil BUMDes (validasi di boundary handler). */
export const profilBumDesSchema = z.object({
  nama: z
    .string({ required_error: "Nama BUMDes wajib diisi" })
    .trim()
    .min(1, "Nama BUMDes wajib diisi")
    .max(MAX_NAMA, `Nama BUMDes maksimal ${MAX_NAMA} karakter`),
  deskripsi: z
    .string({ required_error: "Deskripsi wajib diisi" })
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(MAX_TEKS_PANJANG, `Deskripsi maksimal ${MAX_TEKS_PANJANG} karakter`),
  alamat: optionalText(MAX_TEKS_PANJANG, "Alamat"),
  kontak: optionalText(MAX_KONTAK, "Kontak"),
  tahunBerdiri: z
    .number({ invalid_type_error: "Tahun berdiri harus berupa angka" })
    .int("Tahun berdiri harus bilangan bulat")
    .min(TAHUN_BERDIRI_MIN, `Tahun berdiri minimal ${TAHUN_BERDIRI_MIN}`)
    .refine((v) => v <= new Date().getFullYear(), "Tahun berdiri tidak boleh di masa depan")
    .nullable()
    .optional(),
  imageId: optionalText(MAX_NAMA, "ID gambar"),
});

export type ProfilBumDesInput = z.infer<typeof profilBumDesSchema>;
