import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const updateMonthlyStat = async (context: Context) => {
  const { id } = context.params as { id: string };
  const body = await context.body as {
    month?: string;
    respondentsCount?: number;
  };

  try {
    const updated = await prisma.monthlyStat.update({
      where: { id },
      data: {
        month: body.month,
        respondentsCount: body.respondentsCount,
      },
    });

    return {
      success: true,
      message: "Data MonthlyStat berhasil diupdate",
      data: updated,
    };
  } catch (error) {
    console.error("Gagal update MonthlyStat:", error);
    return {
      success: false,
      message: "Gagal mengupdate data statistik bulanan",
    };
  }
};

export default updateMonthlyStat;
