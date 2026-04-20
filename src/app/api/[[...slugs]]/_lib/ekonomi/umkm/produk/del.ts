import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function produkUmkmDelete(context: Context) {
  const id = context.params.id;

  try {
    // Soft delete
    const data = await prisma.produkUmkm.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      success: true,
      message: "Berhasil menghapus produk UMKM",
      data,
    };
  } catch (e) {
    console.error("Error di produkUmkmDelete:", e);
    return {
      success: false,
      message: "Gagal menghapus produk UMKM",
    };
  }
}

export default produkUmkmDelete;
