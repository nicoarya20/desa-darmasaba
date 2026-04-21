/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function pasarDesaFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const categoryId = context.query.categoryId as string | undefined;
  const skip = (page - 1) * limit;

  // Buat where clause: Tampilkan hanya yang TIDAK punya umkmId (Produk Pasar Murni)
  const where: any = { 
    isActive: true,
    deletedAt: null,
    umkmId: null 
  };

  // Tambahkan filter kategori (jika ada)
  if (categoryId) {
    where.KategoriToPasar = {
      some: {
        kategoriId: categoryId
      }
    };
  }

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { nama: { contains: search, mode: 'insensitive' } },
        { alamatUsaha: { contains: search, mode: 'insensitive' } },
        { 
          KategoriToPasar: { 
            some: { 
              kategori: { 
                nama: { contains: search, mode: 'insensitive' } 
              } 
            } 
          } 
        }
      ]
    });
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.pasarDesa.findMany({
        where,
        include: {
          image: true,
          KategoriToPasar: {
            include: {
              kategori: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pasarDesa.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil pasar desa dengan pagination (Non-UMKM)",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data pasar desa",
    };
  }
}

export default pasarDesaFindMany;