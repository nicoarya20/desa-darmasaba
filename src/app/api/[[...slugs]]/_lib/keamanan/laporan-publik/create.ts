import prisma from "@/lib/prisma";
import { sanitizeRichTextForStorage } from "@/lib/rich-text-server";
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
            // Endpoint publik tanpa login: HTML kiriman warga dibersihkan sebelum disimpan (cegah XSS tersimpan).
            kronologi: kronologi === undefined ? undefined : sanitizeRichTextForStorage(kronologi),
        }
    })

    return {
        success: true,
        data: createdLaporanPublik,
    };
};
export default laporanPublikCreate;
