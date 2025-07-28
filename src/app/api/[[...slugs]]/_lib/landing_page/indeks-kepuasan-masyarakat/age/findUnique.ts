import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const ageStatFindUnique = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    const result = await prisma.ageStat.findUnique({
      where: { id },
      include: {
        MonthlyStat: true,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Data age tidak ditemukan",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Gagal ambil data Age Stat:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data age stat",
    };
  }
};
export default ageStatFindUnique;
