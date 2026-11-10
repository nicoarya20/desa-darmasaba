import prisma from "@/lib/prisma";
import { DESA_ANTI_KORUPSI_DETAIL_INCLUDE, toProgramDetail } from "@/lib/desa-anti-korupsi-view";
import { Context } from "elysia";

export default async function desaAntiKorupsiFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.desaAntiKorupsi.findUnique({
    where: { id },
    include: DESA_ANTI_KORUPSI_DETAIL_INCLUDE, // kategori + folder & dokumen aktif urut `urutan`
  });

  if (!data) {
    throw new Error("Desa anti korupsi tidak ditemukan");
  }

  return {
    success: true,
    message: "Data desa anti korupsi ditemukan",
    data: toProgramDetail(data), // { ...program, folders: [{ ..., dokumen }], dokumenUmum }
  };
}
