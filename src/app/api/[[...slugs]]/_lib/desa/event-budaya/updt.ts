import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function eventBudayaUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const body = context.body as {
    nama: string;
    tanggal: string;
    lokasi: string;
    deskripsi?: string;
  };

  try {
    const data = await prisma.eventBudaya.update({
      where: { id },
      data: {
        nama: body.nama,
        tanggal: new Date(body.tanggal),
        lokasi: body.lokasi,
        deskripsi: body.deskripsi || null,
      },
    });

    return { success: true, message: "Event budaya berhasil diupdate", data };
  } catch (e) {
    console.error("Error di eventBudayaUpdate:", e);
    return { success: false, message: "Gagal mengupdate event budaya" };
  }
}

export default eventBudayaUpdate;
