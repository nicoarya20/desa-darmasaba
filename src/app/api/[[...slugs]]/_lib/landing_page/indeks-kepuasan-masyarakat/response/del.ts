import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const responseStatDelete = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    await prisma.responseStat.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Data response berhasil dihapus",
    };
  } catch (error) {
    console.error("Gagal hapus Response Stat:", error);
    return {
      success: false,
      message: "Gagal menghapus data response stat",
    };
  }
};
export default responseStatDelete;
