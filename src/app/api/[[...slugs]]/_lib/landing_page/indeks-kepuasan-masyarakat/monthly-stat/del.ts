import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const deleteMonthlyStat = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    await prisma.monthlyStat.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Data statistik bulanan berhasil dihapus",
    };
  } catch (error) {
    console.error("Gagal hapus MonthlyStat:", error);
    return {
      success: false,
      message: "Gagal menghapus data statistik bulanan",
    };
  }
};

export default deleteMonthlyStat;

