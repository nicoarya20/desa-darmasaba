import prisma from "@/lib/prisma";
import { Context } from "elysia";

type LaporanPublikInput = {
  judul: string;
  lokasi: string;
  tanggalWaktu: string;
  status: "Selesai" | "Proses" | "Gagal";
  penanganan: string;
  kronologi?: string;
};

const laporanPublikCreate = async (context: Context) => {
  const { judul, lokasi, tanggalWaktu, status, penanganan, kronologi } =
    (await context.body) as LaporanPublikInput;

    const createdLaporanPublik = await prisma.laporanPublik.create({
        data: {
            judul,
            lokasi,
            tanggalWaktu: new Date(tanggalWaktu),
            status,
            penanganan: {
                create: {
                    deskripsi: penanganan,
                },
            },
            kronologi,
        },
        include: {
            penanganan: true,
        }
    })

    return {
        success: true,
        data: createdLaporanPublik,
    };
};
export default laporanPublikCreate;
