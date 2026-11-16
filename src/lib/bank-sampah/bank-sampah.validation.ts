import { z } from "zod";
import { teksOpsionalParsial } from "@/lib/konten-bersama/teks.validation";
import { linkGoogleMapsSchema } from "@/lib/konten-bersama/lokasi.logic";
import { mediaSosialListSchema } from "@/lib/konten-bersama/media-sosial.validation";
import { idListUnik } from "@/lib/konten-bersama/urutan.logic";

/** Batas jumlah pengurus per bank sampah. */
export const MAX_PENGURUS_BANK_SAMPAH = 50;
/** Batas jumlah foto kegiatan per bank sampah (galeri tampil utuh di modal publik). */
export const MAX_FOTO_KEGIATAN_BANK_SAMPAH = 50;
/** Batas jumlah Program Inovasi yang ditautkan ke satu bank sampah. */
export const MAX_INOVASI_BANK_SAMPAH = 30;
export const MAX_DESKRIPSI_BANK_SAMPAH = 5000;
export const MAX_KONTAK_BANK_SAMPAH = 255;

const teksWajib = (pesan: string) => z.string({ required_error: pesan }).trim().min(1, pesan);

/**
 * Skema body POST/PUT bank sampah. Field lama (nama, alamat, nama tempat, koordinat) tetap wajib seperti
 * sebelumnya; field detail baru opsional: `undefined` = tidak diubah (PUT), null/"" = dikosongkan.
 */
export const bankSampahBodySchema = z.object({
  name: teksWajib("Nama bank sampah wajib diisi"),
  alamat: teksWajib("Alamat wajib diisi"),
  namaTempatMaps: teksWajib("Nama tempat di Maps wajib diisi"),
  lat: z.number({ required_error: "Lokasi wajib dipilih di peta" }).finite().min(-90).max(90),
  lng: z.number({ required_error: "Lokasi wajib dipilih di peta" }).finite().min(-180).max(180),
  deskripsi: teksOpsionalParsial({ label: "Deskripsi", max: MAX_DESKRIPSI_BANK_SAMPAH }),
  kontak: teksOpsionalParsial({ label: "Kontak", max: MAX_KONTAK_BANK_SAMPAH }),
  mediaSosial: mediaSosialListSchema.nullable().optional(),
  linkPetunjukArah: linkGoogleMapsSchema,
  fotoBaganStrukturId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v || null)),
  programInovasiIds: z
    .array(z.string().trim().min(1, "ID program inovasi tidak boleh kosong"))
    .max(MAX_INOVASI_BANK_SAMPAH, `Maksimal ${MAX_INOVASI_BANK_SAMPAH} program inovasi`)
    .refine(idListUnik, "Program inovasi dipilih lebih dari sekali")
    .optional(),
});

export type BankSampahBody = z.infer<typeof bankSampahBodySchema>;
