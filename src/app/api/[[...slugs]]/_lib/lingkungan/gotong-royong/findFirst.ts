/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function KegiatanDesaFindFirst(context: Context) {
    const kategori = (context.query.kategori as string) || '';

    const where: any = { isActive: true };

    if (kategori) {
      where.kategoriKegiatan = {
        nama: { equals: kategori, mode: 'insensitive' }
      };
    }

    try {
    const data = await prisma.kegiatanDesa.findFirst({
      where,
      include: {
        image: true,
        kategoriKegiatan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: "Berhasil ambil gotong royong terbaru",
      data,
    };
  } catch (error) {
    console.error('Error di findFirst:', error);
    return {
      success: false,
      message: 'Gagal memuat gotong royong terbaru',
    };
  }
}
