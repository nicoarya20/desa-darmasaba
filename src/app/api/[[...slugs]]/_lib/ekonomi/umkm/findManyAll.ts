import prisma from "@/lib/prisma";

async function umkmFindManyAll() {
  try {
    const data = await prisma.umkm.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        nama: true,
      },
      orderBy: { nama: 'asc' },
    });

    return {
      success: true,
      message: "Berhasil mengambil semua UMKM aktif",
      data,
    };
  } catch (e) {
    console.error("Error di umkmFindManyAll:", e);
    return {
      success: false,
      message: "Gagal mengambil data UMKM",
    };
  }
}

export default umkmFindManyAll;
