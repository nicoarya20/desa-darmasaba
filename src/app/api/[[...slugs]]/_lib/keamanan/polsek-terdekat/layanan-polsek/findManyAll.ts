import prisma from "@/lib/prisma";

async function layananPolsekFindManyAll() {
  try {
    const data = await prisma.layananPolsek.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      message: "Berhasil ambil data layanan polsek",
      data: data.map(item => ({
        ...item,
        // Ensure all required fields are present and properly typed
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
      })),
    };
  } catch (error) {
    console.error("Error layananPolsek.findMany:", error);
    return {
      success: false,
      message: "Gagal mengambil data layanan polsek",
    };
  }
}

export default layananPolsekFindManyAll;
