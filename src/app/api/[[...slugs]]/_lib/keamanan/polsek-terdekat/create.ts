import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    nama: string;
    jarakKeDesa: string;
    alamat: string;
    nomorTelepon: string;
    jamOperasional: string;
    embedMapUrl: string;
    namaTempatMaps: string;
    alamatMaps: string;
    linkPetunjukArah: string;
    layananPolsekId: string[];
};

async function polsekTerdekatCreate(context: Context) {
    const body = context.body as FormCreate;

    // Validate that layananPolsekId is provided and not empty
    if (!body.layananPolsekId || body.layananPolsekId.length === 0) {
        return {
            success: false,
            message: "Pilih minimal 1 layanan polsek",
        };
    }

   try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create PasarDesa with the first kategoriId as the main category
      const polsekTerdekat = await prisma.polsekTerdekat.create({
        data: {
          nama: body.nama,
          jarakKeDesa: body.jarakKeDesa,
          alamat: body.alamat,
          nomorTelepon: body.nomorTelepon,
          jamOperasional: body.jamOperasional,
          embedMapUrl: body.embedMapUrl,
          namaTempatMaps: body.namaTempatMaps,
          alamatMaps: body.alamatMaps,
          linkPetunjukArah: body.linkPetunjukArah,
          layananPolsekId: body.layananPolsekId[0],
          // Use the first category as the main one
        },
      });

      // 2. Create category relationships in KategoriToPasar for all categories
      await prisma.layananToPolsek.createMany({
        data: body.layananPolsekId.map((layananId) => ({
          polsekTerdekatId: polsekTerdekat.id,
          layananId: layananId,
        })),
      });

      // 3. Get the complete data with relationships
      return await prisma.polsekTerdekat.findUnique({
        where: { id: polsekTerdekat.id },
        include: {
          layananPolsek: true,
          LayananToPolsek: {
            include: {
              layanan: true
            },
          },
        },
      });
    });

    return {
      success: true,
      message: "Sukses menambahkan pasar desa",
      data: result,
    };
  } catch (error) {
        console.error("Error creating polsek terdekat:", error);
        return {
            success: false,
            message: "Gagal menambahkan polsek terdekat"
        };
    }
}

export default polsekTerdekatCreate;