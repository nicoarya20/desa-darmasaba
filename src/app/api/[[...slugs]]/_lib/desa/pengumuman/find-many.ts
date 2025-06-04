import prisma from "@/lib/prisma";

export default async function pengumumanFindMany() {
  try {
    const data = await prisma.pengumuman.findMany({
      where: { isActive: true },
      include: {
        CategoryPengumuman: true,
      },
    });
    return {
      success: true,
      message: "Success fetch pengumuman",
      data,
    };
  } catch (e) {
    console.error("Find many error:", e);
    return {
      success: false,
      message: "Failed fetch pengumuman",
    };
  }
}
