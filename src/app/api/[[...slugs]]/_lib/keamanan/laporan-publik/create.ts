import prisma from "@/lib/prisma";
import { Context } from "elysia";

type LaporanPublikInput = {
  judul: string;
  lokasi: string;
  tanggalWaktu: string;
  kronologi?: string;
};

const laporanPublikCreate = async (context: Context) => {
  const { judul, lokasi, tanggalWaktu, kronologi } =
    (await context.body) as LaporanPublikInput;

    const createdLaporanPublik = await prisma.laporanPublik.create({
        data: {
            judul,
            lokasi,
            tanggalWaktu: new Date(tanggalWaktu),
            kronologi,
        }
    })

    return {
        success: true,
        data: createdLaporanPublik,
    };
};
export default laporanPublikCreate;
