import prisma from "@/lib/prisma";
import { Context } from "elysia";

type LaporanPublikUpdateInput = {
  judul: string;
  lokasi: string;
  tanggalWaktu: string;
  status: "SELESAI" | "PROSES" | "GAGAL";
  penanganan: string[];
  kronologi?: string;
};

const LaporanPublikUpdate = async (context: Context) => {
  const id = context.params.id as string;
  const { judul, lokasi, tanggalWaktu, status, penanganan, kronologi } =
    (await context.body) as LaporanPublikUpdateInput;

  await prisma.penangananLaporanPublik.deleteMany({
    where: {
      laporanId: id,
    },
  });

  const updated = await prisma.laporanPublik.update({
    where: {
      id,
    },
    data: {
      judul,
      lokasi,
      tanggalWaktu: new Date(tanggalWaktu),
      status,
      kronologi,
      penanganan: {
        create: penanganan.map((item) => ({
          deskripsi: item,
        })),
      },
    },
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
