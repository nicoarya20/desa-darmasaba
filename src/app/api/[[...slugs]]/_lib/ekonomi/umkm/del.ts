import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDelete(context: Context) {
  const id = context.params.id;

  try {
    // Soft delete
    const data = await prisma.umkm.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      success: true,
      message: "Berhasil menghapus UMKM",
      data,
    };
  } catch (e) {
    console.error("Error di umkmDelete:", e);
    return {
      success: false,
      message: "Gagal menghapus UMKM",
    };
  }
}

export default umkmDelete;
