import { z } from "zod";
import { htmlToPlainText } from "@/lib/rich-text";
import { teksOpsional, teksOpsionalParsial } from "@/lib/konten-bersama/teks.validation";
import { idListUnik } from "@/lib/konten-bersama/urutan.logic";

/** ID tetap baris singleton profil posyandu; menjamin upsert tidak pernah membuat baris kedua. */
export const PROFIL_POSYANDU_ID = "profil-posyandu";

/** Klaster sasaran posyandu, urut tampil. Sama dengan CHECK `KlasterPosyandu_sasaran_check` di migrasi. */
export const SASARAN_KLASTER = ["balita", "remaja", "lansia"] as const;
export type SasaranKlaster = (typeof SASARAN_KLASTER)[number];

export const MAX_DESKRIPSI_PROFIL_POSYANDU = 10000;
export const MAX_JUDUL_KLASTER = 120;
export const MAX_DESKRIPSI_KLASTER = 2000;
export const MAX_JAM_KLASTER = 100;
export const MAX_ALAMAT_POSYANDU = 500;
/** Batas foto galeri (lokasi & kader) per posyandu banjar. */
export const MAX_FOTO_KEGIATAN_POSYANDU = 50;

export const sasaranKlasterSchema = z.enum(SASARAN_KLASTER, {
  errorMap: () => ({ message: "Sasaran klaster harus balita, remaja, atau lansia" }),
});

const teksWajib = (label: string, max: number) =>
  z
    .string({ required_error: `${label} wajib diisi`, invalid_type_error: `${label} harus berupa teks` })
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`);

/** Teks kaya dari editor: wajib ada isi teks (bukan hanya "<p></p>"). */
const teksKayaWajib = (label: string, max: number) =>
  teksWajib(label, max).refine((html) => htmlToPlainText(html) !== "", `${label} wajib diisi`);

/** Teks kaya opsional: isi kosong ("<p></p>", spasi) → null. */
const teksKayaOpsional = (label: string, max: number) =>
  teksOpsional({ label, max }).transform((html) => (html && htmlToPlainText(html) !== "" ? html : null));

/** Skema satu klaster: `imageId` tidak dikirim = gambar tidak diubah, null/"" = gambar dilepas. */
export const klasterPosyanduSchema = z.object({
  sasaran: sasaranKlasterSchema,
  judul: teksWajib("Judul klaster", MAX_JUDUL_KLASTER),
  deskripsi: teksWajib("Fokus layanan klaster", MAX_DESKRIPSI_KLASTER),
  jamPelayanan: teksOpsional({ label: "Jam pelayanan", max: MAX_JAM_KLASTER }),
  imageId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v || null)),
});

/** Skema body PUT profil posyandu: deskripsi umum (wajib), fungsi & kegiatan utama, dan klaster yang diubah. */
export const profilPosyanduBodySchema = z.object({
  deskripsi: teksKayaWajib("Deskripsi umum", MAX_DESKRIPSI_PROFIL_POSYANDU),
  fungsiKegiatan: teksKayaOpsional("Fungsi dan kegiatan utama", MAX_DESKRIPSI_PROFIL_POSYANDU),
  klaster: z
    .array(klasterPosyanduSchema)
    .max(SASARAN_KLASTER.length, `Maksimal ${SASARAN_KLASTER.length} klaster`)
    .refine((items) => idListUnik(items.map((k) => k.sasaran)), "Klaster yang sama dikirim lebih dari sekali")
    .optional(),
});

export type ProfilPosyanduBody = z.infer<typeof profilPosyanduBodySchema>;
export type KlasterPosyanduBody = z.infer<typeof klasterPosyanduSchema>;

/** Alamat posyandu banjar (create/update): tidak dikirim = tidak diubah, kosong = dikosongkan. */
export const alamatPosyanduSchema = teksOpsionalParsial({ label: "Alamat", max: MAX_ALAMAT_POSYANDU });

/** Urutan tampil default klaster (1-based) menurut `SASARAN_KLASTER`. */
export function urutanKlaster(sasaran: SasaranKlaster): number {
  return SASARAN_KLASTER.indexOf(sasaran) + 1;
}
