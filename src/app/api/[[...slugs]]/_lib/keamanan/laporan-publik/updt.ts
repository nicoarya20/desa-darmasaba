/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type LaporanPublikUpdateInput = {
  judul?: string;
  lokasi?: string;
  tanggalWaktu?: string;
  status?: "Selesai" | "Proses" | "Gagal";
  kronologi?: string;
  penanganan?: string;
};

const LaporanPublikUpdate = async (context: Context) => {
  const id = context.params.id as string;
  const { judul, lokasi, tanggalWaktu, status, penanganan, kronologi } =
    (await context.body) as LaporanPublikUpdateInput;

  // Prepare update data with only provided fields
  const updateData: any = {};
  
  if (judul !== undefined) updateData.judul = judul;
  if (lokasi !== undefined) updateData.lokasi = lokasi;
  if (tanggalWaktu !== undefined) updateData.tanggalWaktu = new Date(tanggalWaktu);
  if (status !== undefined) updateData.status = status;
  if (kronologi !== undefined) updateData.kronologi = kronologi;

  // Handle penanganan update if provided
  if (penanganan !== undefined) {
    // Delete existing penanganan
    await prisma.penangananLaporanPublik.deleteMany({
      where: { laporanId: id },
    });

    // Add new penanganan if not empty
    if (penanganan.trim()) {
      updateData.penanganan = {
        create: {
          deskripsi: penanganan,
        },
      };
    }
  }

  const updated = await prisma.laporanPublik.update({
    where: { id },
    data: updateData,
    include: {
      penanganan: true,
    },
  });

  return {
    success: true,
    data: updated,
  };
};
export default LaporanPublikUpdate;
