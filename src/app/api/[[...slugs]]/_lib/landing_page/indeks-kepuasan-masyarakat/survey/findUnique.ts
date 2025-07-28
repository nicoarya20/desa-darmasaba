import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const surveyFindUnique = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        monthlyStats: true,
      },
    });

    if (!survey) {
      return {
        success: false,
        message: "Survey tidak ditemukan",
      };
    }

    return {
      success: true,
      data: survey,
    };
  } catch (error) {
    console.error("Gagal ambil data survey:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data survey",
    };
  }
};
export default surveyFindUnique;