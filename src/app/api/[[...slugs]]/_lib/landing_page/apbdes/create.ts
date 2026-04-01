/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { assignParentIdsToApbdesItems } from "./lib/getParentsID";


type APBDesItemInput = {
  kode: string;
  uraian: string;
  anggaran: number;
  level: number;
  tipe?: string | null;
};

type FormCreate = {
  tahun: number;
  name?: string;
  deskripsi?: string;
  jumlah?: string;
  imageId?: string | null; // Opsional
  fileId?: string | null; // Opsional
  items: APBDesItemInput[];
};

export default async function apbdesCreate(context: Context) {
  const body = context.body as FormCreate;

  console.log('Incoming request body:', JSON.stringify(body, null, 2));

  try {
    // Validate required fields
    if (!body.tahun) {
      throw new Error('Tahun is required');
    }
    // Image dan file sekarang opsional
    if (!body.items || body.items.length === 0) {
      throw new Error('At least one item is required');
    }

    // 1. Buat APBDes + items dengan auto-calculate fields
    const created = await prisma.$transaction(async (prisma) => {
      const apbdes = await prisma.aPBDes.create({
        data: {
          tahun: body.tahun,
          name: body.name || `APBDes Tahun ${body.tahun}`,
          deskripsi: body.deskripsi,
          jumlah: body.jumlah,
          imageId: body.imageId || null, // null jika tidak ada
          fileId: body.fileId || null, // null jika tidak ada
        },
      });

      // Create items dengan auto-calculate totalRealisasi=0, selisih, persentase
      const items = await Promise.all(
        body.items.map(async item => {
          const anggaran = item.anggaran;
          const totalRealisasi = 0; // Belum ada realisasi saat create
          const selisih = anggaran - totalRealisasi; // Sisa anggaran (positif = belum digunakan)
          const persentase = anggaran > 0 ? (totalRealisasi / anggaran) * 100 : 0;

          const itemData = {
            kode: item.kode,
            uraian: item.uraian,
            anggaran: anggaran,
            level: item.level,
            tipe: item.tipe || null,
            totalRealisasi,
            selisih,
            persentase,
            apbdesId: apbdes.id,
          };

          return prisma.aPBDesItem.create({
            data: itemData,
            select: { id: true, kode: true },
          });
        })
      );

      return { ...apbdes, items };
    });

    try {
      // 2. Isi parentId berdasarkan kode
      await assignParentIdsToApbdesItems(created.items);

      // 3. Ambil ulang data lengkap untuk response (include realisasiItems)
      const result = await prisma.aPBDes.findUnique({
        where: { id: created.id },
        include: {
          image: true,
          file: true,
          items: {
            where: { isActive: true },
            orderBy: { kode: 'asc' },
            include: {
              realisasiItems: {
                where: { isActive: true },
                orderBy: { tanggal: 'asc' },
              },
            },
          },
        },
      });

      console.log('APBDes created successfully:', JSON.stringify(result, null, 2));

      return {
        success: true,
        message: "Berhasil membuat APBDes",
        data: result,
      };
    } catch (innerError) {
      console.error('Error in post-creation steps:', innerError);
      return {
        success: true,
        message: "APBDes berhasil dibuat, tetapi ada masalah dengan pemrosesan tambahan",
        data: created,
        warning: process.env.NODE_ENV === 'development' ? String(innerError) : undefined,
      };
    }
  } catch (error: any) {
    console.error("Error creating APBDes:", error);

    if (error.code) console.error('Prisma error code:', error.code);
    if (error.meta) console.error('Prisma error meta:', error.meta);

    const errorMessage = error.message || 'Unknown error';

    context.set.status = 500;
    return {
      success: false,
      message: `Gagal membuat APBDes: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      } : undefined
    };
  }
}