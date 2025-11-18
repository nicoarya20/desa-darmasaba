import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function apbdesDelete(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    context.set.status = 400;
    return {
      success: false,
      message: "ID APBDes diperlukan",
    };
  }

  try {
    // Cek apakah ada
    const existing = await prisma.aPBDes.findUnique({
      where: { id },
    });

    if (!existing) {
      context.set.status = 404;
      return {
        success: false,
        message: "APBDes tidak ditemukan",
      };
    }

    // Soft delete: set isActive = false & isi deletedAt
    const result = await prisma.aPBDes.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    // Opsional: juga soft delete semua item terkait
    await prisma.aPBDesItem.updateMany({
      where: { apbdesId: id },
      data: { 
        isActive: false, 
        deletedAt: new Date() 
      },
    });

    return {
      success: true,
      message: "APBDes berhasil dihapus",
data: result,
    };
  } catch (error) {
    console.error("Error deleting APBDes:", error);
    context.set.status = 500;
    return {
      success: false,
      message: "Gagal menghapus APBDes",
    };
  }
}
