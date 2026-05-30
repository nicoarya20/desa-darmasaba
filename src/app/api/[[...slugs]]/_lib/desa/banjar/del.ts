import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function banjarDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json({ success: false, message: "ID tidak boleh kosong" }, { status: 400 });
    }

    const posyanduCount = await prisma.posyandu.count({
      where: { banjarId: id, isActive: true },
    });

    if (posyanduCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Banjar tidak dapat dihapus karena masih digunakan oleh ${posyanduCount} posyandu`,
        },
        { status: 400 }
      );
    }

    await prisma.banjar.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Banjar berhasil dihapus" };
  } catch (error) {
    console.error("Delete banjar error:", error);
    return Response.json(
      {
        success: false,
        message: "Gagal menghapus banjar: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
