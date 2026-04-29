import prisma from "@/lib/prisma";

async function beasiswaConfigFindUnique() {
  try {
    const data = await prisma.beasiswaConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data };
  } catch (e) {
    console.error("Error di beasiswaConfigFindUnique:", e);
    return { success: false, message: "Gagal mengambil konfigurasi beasiswa" };
  }
}

export default beasiswaConfigFindUnique;
