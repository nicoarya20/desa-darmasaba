import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail } from "../../../_struktur-organisasi/http";
import { keDetail, LEMBAGA_DETAIL_INCLUDE } from "./lembaga.data";

/** GET (publik): detail lembaga beserta foto, pengurus, galeri kegiatan, dan jumlah siswa/pengajar aktif. */
export default async function lembagaPendidikanFindUnique(context: Context) {
  const id = (context.params as { id?: string })?.id;
  if (!id) return fail(context, 400, "ID lembaga pendidikan wajib diisi");

  const data = await prisma.lembaga.findUnique({
    where: { id },
    include: LEMBAGA_DETAIL_INCLUDE,
  });
  if (!data) return fail(context, 404, "Lembaga pendidikan tidak ditemukan");

  return {
    success: true,
    message: "Data lembaga pendidikan ditemukan",
    data: keDetail(data),
  };
}
