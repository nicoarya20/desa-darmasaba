import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK precheck memblokir bila kategori masih dipakai
// pengumuman aktif, dan semua jalur SELALU Response.json (tak throw telanjang)
// agar frontend .json() tak meledak SyntaxError saat error.
export default async function kategoriPengumumanDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const pengumumanCount = await prisma.pengumuman.count({
      where: { categoryPengumumanId: id, isActive: true },
    });

    if (pengumumanCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Kategori pengumuman tidak dapat dihapus karena masih digunakan oleh ${pengumumanCount} pengumuman`,
        },
        { status: 400 }
      );
    }

    await prisma.categoryPengumuman.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Sukses Menghapus kategori pengumuman" };
  } catch (error) {
    console.error("Delete kategori pengumuman error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus kategori pengumuman: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
