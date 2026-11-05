import prisma from "@/lib/prisma";
import { parseEventInput } from "@/lib/agenda-desa";
import { Context } from "elysia";

async function eventBudayaCreate(context: Context) {
  const body = context.body as {
    nama: string;
    tanggal: string;
    lokasi: string;
    deskripsi?: string;
    kategori?: string;
    tanggalSelesai?: string | null;
  };

  const parsed = parseEventInput(body);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }

  try {
    const data = await prisma.eventBudaya.create({
      data: {
        nama: body.nama,
        tanggal: new Date(body.tanggal),
        lokasi: body.lokasi,
        deskripsi: body.deskripsi || null,
        ...parsed.data,
      },
    });

    return { success: true, message: "Event budaya berhasil dibuat", data };
  } catch (e) {
    console.error("Error di eventBudayaCreate:", e);
    return { success: false, message: "Gagal membuat event budaya" };
  }
}

export default eventBudayaCreate;
