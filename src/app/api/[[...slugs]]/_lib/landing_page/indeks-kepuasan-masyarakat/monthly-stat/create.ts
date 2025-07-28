import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const createMonthlyStat = async (context: Context) => {
  const body = await context.body as {
    month: string;
    respondentsCount: number;
    surveyId: string;
  };

  try {
    const created = await prisma.monthlyStat.create({
      data: {
        month: body.month,
        respondentsCount: body.respondentsCount,
        surveyId: body.surveyId,
      },
    });

    return {
      success: true,
      message: "Monthly stat berhasil dibuat",
      data: created,
    };
  } catch (error) {
    console.error("Gagal create monthly stat:", error);
    return {
      success: false,
      message: "Gagal membuat monthly stat",
    };
  }
};
export default createMonthlyStat;