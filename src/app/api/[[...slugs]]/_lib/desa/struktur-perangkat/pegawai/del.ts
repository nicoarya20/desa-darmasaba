import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "../../../fileStorage/_lib/removeStoredFile";
import { fail } from "../http";

/** DELETE (admin): hapus pegawai; foto (FileStorage + MinIO) dihapus SETELAH baris pegawai terhapus. */
export default async function pegawaiDelete(context: Context) {
  const { id } = context.params as { id: string };
  const existing = await prisma.perangkatDesa.findUnique({
    where: { id },
    select: { id: true, image: { select: { id: true, path: true, name: true } } },
  });
  if (!existing) return fail(context, 404, "Perangkat desa tidak ditemukan");

  await prisma.perangkatDesa.delete({ where: { id } });
  if (existing.image) await removeStoredFile(existing.image, `perangkat desa ${id}`);

  return { success: true as const, message: "Perangkat desa berhasil dihapus", data: { id } };
}
