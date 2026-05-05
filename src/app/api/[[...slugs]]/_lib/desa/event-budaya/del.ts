import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function eventBudayaDelete(context: Context) {
  const { id } = context.params as { id: string };

  try {
    await prisma.eventBudaya.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Event budaya berhasil dihapus" };
  } catch (e) {
    console.error("Error di eventBudayaDelete:", e);
    return { success: false, message: "Gagal menghapus event budaya" };
  }
}

export default eventBudayaDelete;
