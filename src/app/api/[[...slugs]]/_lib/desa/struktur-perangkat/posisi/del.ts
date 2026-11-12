import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail } from "../http";

/** DELETE (admin): hapus jabatan; 404 bila tidak ada, 409 bila masih punya pegawai atau jabatan bawahan. */
export default async function posisiDelete(context: Context) {
  const { id } = context.params as { id: string };
  const existing = await prisma.posisiPerangkatDesa.findUnique({
    where: { id },
    select: { id: true, _count: { select: { pegawai: true, children: true } } },
  });
  if (!existing) return fail(context, 404, "Jabatan tidak ditemukan");

  const { pegawai, children } = existing._count;
  if (pegawai > 0) {
    return fail(context, 409, `Jabatan masih dipakai ${pegawai} pegawai; pindahkan atau hapus pegawainya dulu`);
  }
  if (children > 0) {
    return fail(context, 409, `Jabatan masih punya ${children} jabatan bawahan; ubah atasan jabatan tersebut dulu`);
  }

  await prisma.posisiPerangkatDesa.delete({ where: { id } });
  return { success: true as const, message: "Jabatan berhasil dihapus", data: { id } };
}
