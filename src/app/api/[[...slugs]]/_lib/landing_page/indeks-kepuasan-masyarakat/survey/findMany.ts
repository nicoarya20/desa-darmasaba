import prisma from "@/lib/prisma";

export const surveyFindMany = async () => {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        monthlyStats: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: surveys,
    };
  } catch (error) {
    console.error("Gagal ambil data survey:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data survey",
    };
  }
};

export default surveyFindMany;

