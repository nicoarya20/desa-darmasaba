import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK PrestasiDesa.kategoriId bersifat wajib (required),
// sehingga hard delete kategori ber-anak melempar P2003 -> 500. FK precheck
// memblokir lebih dulu; semua jalur SELALU Response.json (tak throw telanjang).
const kategoriPrestasiDelete = async (context: Context) => {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const prestasiCount = await prisma.prestasiDesa.count({
      where: { kategoriId: id, isActive: true },
    });

    if (prestasiCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Kategori prestasi tidak dapat dihapus karena masih digunakan oleh ${prestasiCount} prestasi`,
        },
        { status: 400 }
      );
    }

    await prisma.kategoriPrestasiDesa.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Sukses Menghapus kategori prestasi" };
  } catch (error) {
    console.error("Delete kategori prestasi error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus kategori prestasi: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
};

export default kategoriPrestasiDelete;
