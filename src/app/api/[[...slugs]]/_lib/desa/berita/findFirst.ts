/* eslint-disable @typescript-eslint/no-explicit-any */
// find-first.ts
import prisma from "@/lib/prisma";
import { BERITA_LIST_ORDER_BY } from "@/lib/berita-data";
import { Context } from "elysia";

async function beritaFindFirst(context: Context) {
  const kategori = (context.query.kategori as string) || '';

  const where: any = { isActive: true };

  if (kategori) {
    where.kategoriBerita = {
      name: { equals: kategori, mode: 'insensitive' }
    };
  }

  try {
    const data = await prisma.berita.findFirst({
      where,
      include: {
        image: true,
        kategoriBerita: true,
      },
      orderBy: BERITA_LIST_ORDER_BY,
    });

    return {
      success: true,
      message: "Berhasil ambil berita terbaru",
      data,
    };
  } catch (e) {
    console.error("Error di findFirst:", e);
    return {
      success: false,
      message: "Gagal ambil berita terbaru",
    };
  }
}

export default beritaFindFirst;