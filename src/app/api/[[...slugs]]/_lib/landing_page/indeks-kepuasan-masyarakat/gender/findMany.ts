import prisma from "@/lib/prisma";

export const genderStatFindMany = async () => {
  try {
    const result = await prisma.genderStat.findMany({
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
    console.error("Gagal ambil data Gender Stat:", error);
    return {
      success: false,
      message: "Gagal mengambil data gender stat",
    };
  }
};
export default genderStatFindMany;
