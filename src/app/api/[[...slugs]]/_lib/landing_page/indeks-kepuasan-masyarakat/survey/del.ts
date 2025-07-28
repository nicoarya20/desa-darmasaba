import { Context } from "elysia";
import prisma from "@/lib/prisma";

export const surveyDelete = async (context: Context) => {
  const { id } = context.params as { id: string };

  try {
    await prisma.survey.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Survey berhasil dihapus",
    };
  } catch (error) {
    console.error("Gagal hapus survey:", error);
    return {
      success: false,
      message: "Gagal menghapus survey",
    };
  }
};
export default surveyDelete;
