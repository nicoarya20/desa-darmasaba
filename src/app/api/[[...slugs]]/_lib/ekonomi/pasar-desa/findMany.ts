import prisma from "@/lib/prisma";

export default async function pasarDesaFindMany() {
  const data = await prisma.pasarDesa.findMany({
    where: {
      isActive: true, // Opsional filter
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      image: true,
      KategoriToPasar: {
        include: {
          kategori: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Berhasil mengambil semua data pasar desa",
    data,
  };
}
