import prisma from "@/lib/prisma";

async function ringkasanKesehatanFindUnique() {
  try {
    const data = await prisma.ringkasanKesehatanDesa.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data };
  } catch (e) {
    console.error("Error di ringkasanKesehatanFindUnique:", e);
    return { success: false, message: "Gagal mengambil ringkasan kesehatan" };
  }
}

export default ringkasanKesehatanFindUnique;
