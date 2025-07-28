import prisma from "@/lib/prisma";

export const findManyMonthlyStat = async () => {
  try {
    const result = await prisma.monthlyStat.findMany({
      include: {
        survey: true,
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
    console.error("Gagal ambil data MonthlyStat:", error);
    return {
      success: false,
      message: "Gagal mengambil data statistik bulanan",
    };
  }
};
export default findManyMonthlyStat;