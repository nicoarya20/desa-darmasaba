import prisma from "@/lib/prisma";
import { susunDataCreate, type PengumumanBody } from "@/lib/pengumuman-lampiran";
import { Context } from "elysia";
import { validasiLampiran } from "./lampiran-check";

export async function pengumumanCreate(context: Context) {
  const body = context.body as PengumumanBody;

  const lampiran = await validasiLampiran(body);
  if (!lampiran.ok) {
    context.set.status = 400;
    return { success: false, message: lampiran.message };
  }

  let id: string;
  try {
    const created = await prisma.pengumuman.create({
      data: susunDataCreate(body, lampiran.data),
      select: { id: true },
    });
    id = created.id;
  } catch (error) {
    console.error("Gagal membuat pengumuman:", error);
    return {
      success: false,
      message: "Failed create pengumuman",
      error: error,
    };
  }

  return {
    success: true,
    message: "Sukses menambahkan pengumuman",
    data: {
      ...body,
      id,
    },
  };
}
