import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const responseStatFindUnique = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    const result = await prisma.responseStat.findUnique({
      where: { id },
      include: {
        MonthlyStat: true,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Data response tidak ditemukan",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Gagal ambil data Response Stat:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data response stat",
    };
  }
};
export default responseStatFindUnique;
