import { parseOptionalDate, parseOptionalEmail, parseOptionalText } from "@/lib/struktur-organisasi";
import { z } from "zod";
import { fromResult } from "../http";

// Batas mengikuti kolom @db.VarChar di schema PerangkatDesa.
const MAX_NAMA = 255;
const MAX_GELAR = 100;
const MAX_TELEPON = 20;
const MAX_ALAMAT = 5000;
const MAX_ID = 100;

const optionalText = (max: number, label: string) =>
  fromResult((v) => parseOptionalText(v, { max, label })).optional();

/**
 * Skema body POST/PUT pegawai: hanya `namaLengkap` + `posisiId` wajib. Field opsional:
 * string kosong/spasi → null (dikosongkan), tidak dikirim → undefined (tidak diubah saat PUT).
 */
export const pegawaiBodySchema = z.object({
  namaLengkap: z
    .string({ required_error: "Nama lengkap wajib diisi" })
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(MAX_NAMA, `Nama lengkap maksimal ${MAX_NAMA} karakter`),
  posisiId: z
    .string({ required_error: "Jabatan wajib dipilih" })
    .trim()
    .min(1, "Jabatan wajib dipilih")
    .max(MAX_ID, "ID jabatan tidak valid"),
  gelarAkademik: optionalText(MAX_GELAR, "Gelar akademik"),
  imageId: optionalText(MAX_ID, "ID gambar"),
  tanggalMasuk: fromResult(parseOptionalDate).optional(),
  email: fromResult((v) => parseOptionalEmail(v)).optional(),
  telepon: optionalText(MAX_TELEPON, "Telepon"),
  alamat: optionalText(MAX_ALAMAT, "Alamat"),
  isActive: z.boolean({ invalid_type_error: "isActive harus boolean" }).optional(),
});

export type PegawaiBody = z.infer<typeof pegawaiBodySchema>;
