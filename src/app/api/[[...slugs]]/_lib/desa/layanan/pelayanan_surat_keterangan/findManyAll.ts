import prisma from "@/lib/prisma";
import { SOP_FILE_SELECT } from "../sop-file";

export default async function pelayananSuratKeteranganFindManyAll() {
  try {
    const data = await prisma.pelayananSuratKeterangan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        image: true,
        image2: true,
        sopFile: { select: SOP_FILE_SELECT },
      },
    });

    return {
      success: true,
      message: "Berhasil ambil semua data pelayanan surat keterangan",
      data,
    };
  } catch (e) {
    console.error("Error di findManyAll:", e);
    return {
      success: false,
      message: "Gagal mengambil data pelayanan surat keterangan",
      data: [],
    };
  }
}
