import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function banjarFindMany(context: Context) {
  try {
    const data = await prisma.banjar.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data };
  } catch (e) {
    console.error("Error di banjarFindMany:", e);
    return { success: false, message: "Gagal mengambil data banjar" };
  }
}

export default banjarFindMany;
