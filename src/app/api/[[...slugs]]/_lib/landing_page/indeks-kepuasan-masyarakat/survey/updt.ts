import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateSurvey = {
  title?: string;
  tahun?: number;
  totalRespondents?: number;
  averageScore?: number;
};

const surveyUpdate = async (context: Context) => {
  const id = context.params?.id as string;
  const body = await context.body as FormUpdateSurvey;

  if (!id) {
    return {
      success: false,
      message: "ID survey wajib diisi",
    };
  }

  try {
    const updated = await prisma.survey.update({
      where: { id },
      data: {
        title: body.title,
        totalRespondents: body.totalRespondents,
        averageScore: body.averageScore,
      },
      include: {
        monthlyStats: true,
      },
    });

    return {
      success: true,
      message: "Berhasil update survey ",
      data: updated,
    };
  } catch (error) {
    console.error("Gagal update survey :", error);
    return {
      success: false,
      message: "Gagal update survey ",
    };
  }
};

export default surveyUpdate;
