import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const findUniqueMonthlyStat = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    const result = await prisma.monthlyStat.findUnique({
      where: { id },
      include: {
        survey: true,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Data tidak ditemukan",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Gagal ambil data MonthlyStat:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
    };
  }
};
export default findUniqueMonthlyStat;

