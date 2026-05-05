import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function eventBudayaCreate(context: Context) {
  const body = context.body as {
    nama: string;
    tanggal: string;
    lokasi: string;
    deskripsi?: string;
  };

  try {
    const data = await prisma.eventBudaya.create({
      data: {
        nama: body.nama,
        tanggal: new Date(body.tanggal),
        lokasi: body.lokasi,
        deskripsi: body.deskripsi || null,
      },
    });

    return { success: true, message: "Event budaya berhasil dibuat", data };
  } catch (e) {
    console.error("Error di eventBudayaCreate:", e);
    return { success: false, message: "Gagal membuat event budaya" };
  }
}

export default eventBudayaCreate;
