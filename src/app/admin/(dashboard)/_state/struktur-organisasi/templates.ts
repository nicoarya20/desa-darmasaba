import { parseOptionalEmail } from "@/lib/struktur-organisasi";
import { z } from "zod";
import type { PegawaiForm, PosisiForm } from "./types";

/** Validasi form jabatan di klien: hanya nama + hierarki wajib. */
export const templatePosisi = z.object({
  nama: z.string().trim().min(1, "Nama jabatan wajib diisi"),
  hierarki: z
    .number({ required_error: "Hierarki wajib diisi", invalid_type_error: "Hierarki wajib diisi" })
    .int("Hierarki harus bilangan bulat")
    .min(1, "Hierarki minimal 1"),
  deskripsi: z.string().optional(),
  urutan: z.number().int("Urutan harus bilangan bulat").min(0, "Urutan tidak boleh negatif").nullable().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

/** Validasi form pegawai di klien: hanya nama lengkap + jabatan wajib; email dicek bila diisi. */
export const templatePegawai = z.object({
  namaLengkap: z.string().trim().min(1, "Nama lengkap wajib diisi"),
  posisiId: z.string().trim().min(1, "Jabatan wajib dipilih"),
  imageId: z.string().optional(),
  email: z.string().optional().superRefine((value, ctx) => {
    const result = parseOptionalEmail(value);
    if (!result.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
  }),
  telepon: z.string().optional(),
  isActive: z.boolean().optional(),
});

/** Form jabatan kosong. */
export const defaultPosisiForm = (): PosisiForm => ({
  nama: "",
  deskripsi: "",
  hierarki: null,
  urutan: null,
  parentId: "",
  isActive: true,
});

/** Form pegawai kosong. */
export const defaultPegawaiForm = (): PegawaiForm => ({
  namaLengkap: "",
  imageId: "",
  email: "",
  telepon: "",
  posisiId: "",
  isActive: true,
});
