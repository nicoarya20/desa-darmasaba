import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail, PEGAWAI_SELECT, validationFailure, writeFailure } from "../http";
import { posisiExists } from "./posisi-exists";
import { pegawaiBodySchema } from "./validation";

/** POST (admin): tambah pegawai; hanya nama + jabatan wajib, field opsional kosong disimpan null. */
export default async function pegawaiCreate(context: Context) {
  const parsed = pegawaiBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const body = parsed.data;

  if (!(await posisiExists(body.posisiId))) return fail(context, 400, "Jabatan tidak ditemukan");

  try {
    const data = await prisma.perangkatDesa.create({
      data: {
        namaLengkap: body.namaLengkap,
        posisiId: body.posisiId,
        gelarAkademik: body.gelarAkademik ?? null,
        imageId: body.imageId ?? null,
        tanggalMasuk: body.tanggalMasuk ?? null,
        email: body.email ?? null,
        telepon: body.telepon ?? null,
        alamat: body.alamat ?? null,
        isActive: body.isActive ?? true,
      },
      select: PEGAWAI_SELECT,
    });
    return { success: true as const, message: "Perangkat desa berhasil ditambahkan", data };
  } catch (error) {
    return writeFailure(error, context);
  }
}
