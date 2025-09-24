import prisma from "@/lib/prisma";

export default async function pelayananSuratKeteranganFindManyAll() {
  try {
    const data = await prisma.pelayananSuratKeterangan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        image: true,
        image2: true,
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
