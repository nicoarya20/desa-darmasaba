import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pendaftaranJadwalKegiatanDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  await prisma.pendaftaranJadwalKegiatan.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Pendaftaran jadwal kegiatan berhasil dihapus",
    status: 200,
  };
}
