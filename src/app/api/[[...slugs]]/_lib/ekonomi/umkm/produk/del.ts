import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function produkUmkmDelete(context: Context) {
  const id = context.params.id;

  try {
    // Soft delete on PasarDesa
    const data = await prisma.pasarDesa.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      success: true,
      message: "Berhasil menghapus produk UMKM (PasarDesa)",
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
