import prisma from "@/lib/prisma";

export default async function userFindMany() {
  try {
    const data = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Success get all user",
      data,
    };
  } catch (error) {
    console.error("Find many error:", error);
    return {
      success: false,
      message:
        "Gagal mengambil data: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
