import { parseOptionalDate, parseOptionalEmail, parseOptionalText } from "@/lib/struktur-organisasi";
import { z } from "zod";
import { fromResult } from "./http";

// Batas mengikuti kolom @db.VarChar yang sama di tabel jabatan/pegawai semua struktur.
const MAX_NAMA_JABATAN = 100;
const MAX_DESKRIPSI = 5000;
const MAX_NAMA = 255;
const MAX_GELAR = 100;
const MAX_TELEPON = 20;
const MAX_ALAMAT = 5000;
const MAX_ID = 100;
/** Batas level bagan; 1 = puncak. */
export const MAX_HIERARKI = 99;
/** Batas atas `urutan` agar nilai sembarang tidak merusak pengurutan. */
export const MAX_URUTAN = 9999;

const optionalText = (max: number, label: string) =>
  fromResult((v) => parseOptionalText(v, { max, label })).optional();

const posisiFields = z.object({
  nama: z
    .string({ required_error: "Nama jabatan wajib diisi" })
    .trim()
    .min(1, "Nama jabatan wajib diisi")
    .max(MAX_NAMA_JABATAN, `Nama jabatan maksimal ${MAX_NAMA_JABATAN} karakter`),
  hierarki: z
    .number({ required_error: "Hierarki wajib diisi", invalid_type_error: "Hierarki harus berupa angka" })
    .int("Hierarki harus bilangan bulat")
    .min(1, "Hierarki minimal 1")
    .max(MAX_HIERARKI, `Hierarki maksimal ${MAX_HIERARKI}`),
  deskripsi: optionalText(MAX_DESKRIPSI, "Deskripsi"),
  urutan: z
    .number({ invalid_type_error: "Urutan harus berupa angka" })
    .int("Urutan harus bilangan bulat")
    .min(0, "Urutan tidak boleh negatif")
    .max(MAX_URUTAN, `Urutan maksimal ${MAX_URUTAN}`)
    .optional(),
  // Kosong/spasi → null (jabatan puncak).
  parentId: optionalText(MAX_ID, "ID atasan"),
});

/** Skema body POST jabatan: nama + hierarki wajib. */
export const posisiCreateSchema = posisiFields;

/** Skema body PUT jabatan: seperti create + isActive opsional; field yang tidak dikirim tidak diubah. */
export const posisiUpdateSchema = posisiFields.extend({
  isActive: z.boolean({ invalid_type_error: "isActive harus boolean" }).optional(),
});

/**
 * Skema body POST/PUT pegawai: hanya `namaLengkap` (sudah termasuk gelar) + `posisiId` wajib. Field opsional:
 * string kosong/spasi → null (dikosongkan), tidak dikirim → undefined (tidak diubah saat PUT).
 * `gelarAkademik`/`tanggalMasuk`/`alamat` tidak lagi ada di form admin; tetap diterima demi kompatibilitas.
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
