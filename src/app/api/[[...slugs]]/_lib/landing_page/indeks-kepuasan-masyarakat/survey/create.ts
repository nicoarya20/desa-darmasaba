import prisma from "@/lib/prisma";
import { Context } from "elysia";

const surveyCreate = async (context: Context) => {
  const body = await context.body as {
    title: string;
    totalRespondents: number;
    averageScore: number;
  };

  // Validasi
  if (!body.title || !body.totalRespondents || body.averageScore === undefined) {
    return {
      success: false,
      message: "Field title, tahun, dan skor wajib diisi",
    };
  }

  try {
    const created = await prisma.survey.create({
      data: {
        title: body.title,
        totalRespondents: body.totalRespondents,
        averageScore: body.averageScore,
      },
    });

    return {
      success: true,
      message: "Survey  berhasil dibuat",
      data: created,
    };
  } catch (error) {
    console.error("Gagal create survey :", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat survey ",
    };
  }
};

export default surveyCreate;
