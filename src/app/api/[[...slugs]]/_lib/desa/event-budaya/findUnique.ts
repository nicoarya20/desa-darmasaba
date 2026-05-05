import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function eventBudayaFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  try {
    const data = await prisma.eventBudaya.findFirst({
      where: { id, isActive: true },
    });

    if (!data) {
      return { success: false, message: "Event budaya tidak ditemukan" };
    }

    return { success: true, data };
  } catch (e) {
    console.error("Error di eventBudayaFindUnique:", e);
    return { success: false, message: "Gagal mengambil data event budaya" };
  }
}

export default eventBudayaFindUnique;
