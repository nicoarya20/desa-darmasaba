import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const genderStatFindUnique = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    const result = await prisma.genderStat.findUnique({
      where: { id },
      include: {
        MonthlyStat: true,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Data gender tidak ditemukan",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Gagal ambil data Gender Stat:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data gender stat",
    };
  }
};
export default genderStatFindUnique;
