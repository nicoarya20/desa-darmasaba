import prisma from "@/lib/prisma";

async function eventBudayaFindUpcoming() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const data = await prisma.eventBudaya.findMany({
      where: {
        isActive: true,
        tanggal: { gte: today },
      },
      orderBy: { tanggal: "asc" },
      take: 20,
    });

    return { success: true, data };
  } catch (e) {
    console.error("Error di eventBudayaFindUpcoming:", e);
    return { success: false, message: "Gagal mengambil event mendatang" };
  }
}

export default eventBudayaFindUpcoming;
