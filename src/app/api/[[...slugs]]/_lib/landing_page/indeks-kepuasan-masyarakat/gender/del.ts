import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const genderStatDelete = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    await prisma.genderStat.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Data gender berhasil dihapus",
    };
  } catch (error) {
    console.error("Gagal hapus Gender Stat:", error);
    return {
      success: false,
      message: "Gagal menghapus data gender",
    };
  }
};
export default genderStatDelete;
