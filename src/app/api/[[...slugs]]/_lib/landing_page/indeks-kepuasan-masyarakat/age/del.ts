import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const ageStatDelete = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    await prisma.ageStat.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Data age berhasil dihapus",
    };
  } catch (error) {
    console.error("Gagal hapus Age Stat:", error);
    return {
      success: false,
      message: "Gagal menghapus data age stat",
    };
  }
};
export default ageStatDelete;
