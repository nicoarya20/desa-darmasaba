import { parseOptionalText } from "@/lib/struktur-organisasi";
import { z } from "zod";
import { fromResult } from "../http";

const MAX_NAMA = 100;
const MAX_DESKRIPSI = 5000;
/** Batas level bagan; 1 = puncak. */
export const MAX_HIERARKI = 99;
/** Batas atas `urutan` agar nilai sembarang tidak merusak pengurutan. */
export const MAX_URUTAN = 9999;

const posisiFields = z.object({
  nama: z
    .string({ required_error: "Nama jabatan wajib diisi" })
    .trim()
    .min(1, "Nama jabatan wajib diisi")
    .max(MAX_NAMA, `Nama jabatan maksimal ${MAX_NAMA} karakter`),
  hierarki: z
    .number({ required_error: "Hierarki wajib diisi", invalid_type_error: "Hierarki harus berupa angka" })
    .int("Hierarki harus bilangan bulat")
    .min(1, "Hierarki minimal 1")
    .max(MAX_HIERARKI, `Hierarki maksimal ${MAX_HIERARKI}`),
  deskripsi: fromResult((v) => parseOptionalText(v, { max: MAX_DESKRIPSI, label: "Deskripsi" })).optional(),
  urutan: z
    .number({ invalid_type_error: "Urutan harus berupa angka" })
    .int("Urutan harus bilangan bulat")
    .min(0, "Urutan tidak boleh negatif")
    .max(MAX_URUTAN, `Urutan maksimal ${MAX_URUTAN}`)
    .optional(),
  // Kosong/spasi → null (jabatan puncak).
  parentId: fromResult((v) => parseOptionalText(v, { max: 100, label: "ID atasan" })).optional(),
});

/** Skema body POST jabatan: nama + hierarki wajib. */
export const posisiCreateSchema = posisiFields;

/** Skema body PUT jabatan: seperti create + isActive opsional; field yang tidak dikirim tidak diubah. */
export const posisiUpdateSchema = posisiFields.extend({
  isActive: z.boolean({ invalid_type_error: "isActive harus boolean" }).optional(),
});
