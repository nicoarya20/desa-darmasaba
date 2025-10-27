/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyAll.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function kategoriProdukFindManyAll(context: Context) {
  // Ambil query search (opsional)
  const search2 = (context.query.search as string) || "";

  // Buat where clause
  const where: any = { isActive: true };

  if (search2) {
    where.OR = [
      { nama: { contains: search2, mode: "insensitive" } },
      {
        KategoriToPasar: {
          some: {
            kategori: {
              nama: { contains: search2, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  try {
    const data = await prisma.kategoriProduk.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      message: "Berhasil ambil semua kategori produk",
      data,
      total: data.length,
    };
  } catch (e) {
    console.error("Error di findManyAll:", e);
    return {
      success: false,
      message: "Gagal mengambil data kategori produk",
    };
  }
}

export default kategoriProdukFindManyAll;
