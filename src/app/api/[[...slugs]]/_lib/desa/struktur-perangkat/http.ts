import { toForeignKeyResponse } from "@/lib/prisma-error";
import type { Prisma } from "@prisma/client";
import type { NormalizeResult } from "@/lib/struktur-organisasi";
import { z, type ZodError } from "zod";

// Context Elysia dilonggarkan: handler hanya menulis `set.status`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tipe status Elysia (union StatusMap) terlalu spesifik
export type StatusContext = { set: { status?: any } };

/** Respons gagal seragam kontrak: status HTTP + `{ success: false, message }`. */
export function fail(context: StatusContext, status: 400 | 404 | 409 | 500, message: string) {
  context.set.status = status;
  return { success: false as const, message };
}

/** Respons 400 dari hasil validasi zod. */
export function validationFailure(context: StatusContext, error: ZodError) {
  return fail(context, 400, error.issues.map((issue) => issue.message).join("; "));
}

/** Terjemahkan FK violation (mis. imageId/posisiId sudah dihapus) menjadi 400; error lain dilempar ulang. */
export function writeFailure(error: unknown, context: StatusContext) {
  const foreignKey = toForeignKeyResponse(error);
  if (foreignKey) return fail(context, 400, foreignKey.message);
  throw error;
}

/** Adaptor zod untuk fungsi normalisasi murni: hasil `ok: false` menjadi issue validasi. */
export function fromResult<T>(parse: (value: string | null) => NormalizeResult<T>) {
  return z
    .string()
    .nullable()
    .transform((value, ctx) => {
      const result = parse(value);
      if (result.ok) return result.value;
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
      return z.NEVER;
    });
}

/** Field jabatan yang dikirim ke klien (kontrak `Posisi`). */
export const POSISI_SELECT = {
  id: true,
  nama: true,
  deskripsi: true,
  hierarki: true,
  urutan: true,
  parentId: true,
  isActive: true,
  _count: { select: { pegawai: true } },
} as const;

/** Field pegawai yang dikirim ke klien (kontrak `Pegawai`); gambar tanpa path server. */
export const PEGAWAI_SELECT = {
  id: true,
  namaLengkap: true,
  gelarAkademik: true,
  imageId: true,
  image: { select: { id: true, link: true } },
  tanggalMasuk: true,
  email: true,
  telepon: true,
  alamat: true,
  posisiId: true,
  posisi: { select: { id: true, nama: true, hierarki: true, urutan: true, parentId: true } },
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Urutan default list pegawai: level bagan, urutan jabatan, lalu nama. */
export const PEGAWAI_ORDER: Prisma.PerangkatDesaOrderByWithRelationInput[] = [
  { posisi: { hierarki: "asc" } },
  { posisi: { urutan: "asc" } },
  { namaLengkap: "asc" },
];
