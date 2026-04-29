/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function beasiswaConfigUpdate(context: Context) {
  const body = context.body as any;

  try {
    const existing = await prisma.beasiswaConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = existing
      ? await prisma.beasiswaConfig.update({
          where: { id: existing.id },
          data: {
            tahunAjaran: body.tahunAjaran,
            danaTersalurkan: BigInt(body.danaTersalurkan),
          },
        })
      : await prisma.beasiswaConfig.create({
          data: {
            tahunAjaran: body.tahunAjaran,
            danaTersalurkan: BigInt(body.danaTersalurkan),
          },
        });

    return { success: true, message: "Konfigurasi beasiswa berhasil disimpan", data: { ...data, danaTersalurkan: data.danaTersalurkan.toString() } };
  } catch (e) {
    console.error("Error di beasiswaConfigUpdate:", e);
    return { success: false, message: "Gagal menyimpan konfigurasi beasiswa" };
  }
}

export default beasiswaConfigUpdate;
