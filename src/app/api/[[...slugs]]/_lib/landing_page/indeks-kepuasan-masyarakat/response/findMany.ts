import prisma from "@/lib/prisma";

export const responseStatFindMany = async () => {
  try {
    const result = await prisma.responseStat.findMany({
      include: {
        MonthlyStat: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Gagal ambil data Response Stat:", error);
    return {
      success: false,
      message: "Gagal mengambil data response stat",
    };
  }
};
export default responseStatFindMany;
