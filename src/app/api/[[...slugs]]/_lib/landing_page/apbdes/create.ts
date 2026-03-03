/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { assignParentIdsToApbdesItems } from "./lib/getParentsID";


type APBDesItemInput = {
  kode: string;
  uraian: string;
  anggaran: number;
  realisasi: number;
  selisih: number;
  persentase: number;
  level: number;
  tipe?: string | null;
};

type FormCreate = {
  tahun: number;
  name?: string;
  deskripsi?: string;
  jumlah?: string;
  imageId: string;
  fileId: string;
  items: APBDesItemInput[];
};

export default async function apbdesCreate(context: Context) {
  const body = context.body as FormCreate;
  
  // Log the incoming request for debugging
  console.log('Incoming request body:', JSON.stringify(body, null, 2));

  try {
    // Validate required fields
    if (!body.tahun) {
      throw new Error('Tahun is required');
    }
    if (!body.imageId) {
      throw new Error('Image ID is required');
    }
    if (!body.fileId) {
      throw new Error('File ID is required');
    }
    if (!body.items || body.items.length === 0) {
      throw new Error('At least one item is required');
    }

    // 1. Buat APBDes + items (tanpa parentId dulu)
    const created = await prisma.$transaction(async (prisma) => {
      const apbdes = await prisma.aPBDes.create({
        data: {
          tahun: body.tahun,
          name: body.name || `APBDes Tahun ${body.tahun}`,
          deskripsi: body.deskripsi,
          jumlah: body.jumlah,
          imageId: body.imageId,
          fileId: body.fileId,
        },
      });

      // Create items in a batch
      const items = await Promise.all(
        body.items.map(item => {
          // Create a new object with only the fields that exist in the APBDesItem model
          const itemData = {
            kode: item.kode,
            uraian: item.uraian,
            anggaran: item.anggaran,
            realisasi: item.realisasi,
            selisih: item.selisih,
            persentase: item.persentase,
            level: item.level,
            tipe: item.tipe, // ✅ sertakan, biar null
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

      // 3. Ambil ulang data lengkap untuk response
      const result = await prisma.aPBDes.findUnique({
        where: { id: created.id },
        include: {
          image: true,
          file: true,
          items: {
            orderBy: { kode: 'asc' },
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
      // Even if post-creation steps fail, we still return success since the main record was created
      return {
        success: true,
        message: "APBDes berhasil dibuat, tetapi ada masalah dengan pemrosesan tambahan",
        data: created,
        warning: process.env.NODE_ENV === 'development' ? String(innerError) : undefined,
      };
    }
  } catch (error: any) {
    console.error("Error creating APBDes:", error);
    
    // Log the full error for debugging
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