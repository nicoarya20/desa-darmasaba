/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function ringkasanKesehatanUpdate(context: Context) {
  const body = context.body as any;

  try {
    const existing = await prisma.ringkasanKesehatanDesa.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = existing
      ? await prisma.ringkasanKesehatanDesa.update({
          where: { id: existing.id },
          data: {
            ibuHamilAkh: Number(body.ibuHamilAkh),
            balitaTerdaftar: Number(body.balitaTerdaftar),
            alertStunting: Number(body.alertStunting),
          },
        })
      : await prisma.ringkasanKesehatanDesa.create({
          data: {
            ibuHamilAkh: Number(body.ibuHamilAkh),
            balitaTerdaftar: Number(body.balitaTerdaftar),
            alertStunting: Number(body.alertStunting),
          },
        });

    return { success: true, message: "Ringkasan kesehatan berhasil disimpan", data };
  } catch (e) {
    console.error("Error di ringkasanKesehatanUpdate:", e);
    return { success: false, message: "Gagal menyimpan ringkasan kesehatan" };
  }
}

export default ringkasanKesehatanUpdate;
