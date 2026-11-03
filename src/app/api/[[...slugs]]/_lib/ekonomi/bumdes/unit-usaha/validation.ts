import { z } from "zod";

const MAX_NAMA = 255;
const MAX_DESKRIPSI = 5000;
/** Batas atas `urutan` agar nilai sembarang (mis. 10^9) tidak merusak pengurutan. */
export const MAX_URUTAN = 9999;

const unitUsahaFields = z.object({
  nama: z
    .string({ required_error: "Nama unit usaha wajib diisi" })
    .trim()
    .min(1, "Nama unit usaha wajib diisi")
    .max(MAX_NAMA, `Nama unit usaha maksimal ${MAX_NAMA} karakter`),
  deskripsi: z
    .string({ required_error: "Deskripsi wajib diisi" })
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(MAX_DESKRIPSI, `Deskripsi maksimal ${MAX_DESKRIPSI} karakter`),
  imageId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  urutan: z
    .number({ invalid_type_error: "Urutan harus berupa angka" })
    .int("Urutan harus bilangan bulat")
    .min(0, "Urutan tidak boleh negatif")
    .max(MAX_URUTAN, `Urutan maksimal ${MAX_URUTAN}`)
    .optional(),
  isActive: z.boolean({ invalid_type_error: "isActive harus boolean" }).optional(),
});

/** Skema body POST unit usaha: nama + deskripsi wajib, sisanya opsional. */
export const unitUsahaCreateSchema = unitUsahaFields;

/** Skema body PUT unit usaha: semua field opsional, tetapi yang dikirim tetap divalidasi. */
export const unitUsahaUpdateSchema = unitUsahaFields.partial();

export type UnitUsahaCreateInput = z.infer<typeof unitUsahaCreateSchema>;
