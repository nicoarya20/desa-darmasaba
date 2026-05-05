import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function ringkasanKesehatanUpdate(context: Context) {
  const body = context.body as { targetStuntingPct: number };

  try {
    const existing = await prisma.ringkasanKesehatanDesa.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const data = existing
      ? await prisma.ringkasanKesehatanDesa.update({
          where: { id: existing.id },
          data: { targetStuntingPct: Number(body.targetStuntingPct) },
        })
      : await prisma.ringkasanKesehatanDesa.create({
          data: { targetStuntingPct: Number(body.targetStuntingPct) },
        });

    return { success: true, message: "Target stunting berhasil disimpan", data };
  } catch (e) {
    console.error("Error di ringkasanKesehatanUpdate:", e);
    return { success: false, message: "Gagal menyimpan target stunting" };
  }
}

export default ringkasanKesehatanUpdate;
