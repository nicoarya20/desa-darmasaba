import prisma from "@/lib/prisma";

export const ageStatFindMany = async () => {
  try {
    const result = await prisma.ageStat.findMany({
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
    console.error("Gagal ambil data Age Stat:", error);
    return {
      success: false,
      message: "Gagal mengambil data age stat",
    };
  }
};
export default ageStatFindMany;
