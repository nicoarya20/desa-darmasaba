import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK KegiatanDesa.kategoriKegiatanId bersifat wajib
// (required), sehingga hard delete kategori ber-anak melempar P2003 -> 500.
// FK precheck memblokir lebih dulu; semua jalur SELALU Response.json.
const kategoriKegiatanDelete = async (context: Context) => {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const kegiatanCount = await prisma.kegiatanDesa.count({
      where: { kategoriKegiatanId: id, isActive: true },
    });

    if (kegiatanCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Kategori kegiatan tidak dapat dihapus karena masih digunakan oleh ${kegiatanCount} kegiatan`,
        },
        { status: 400 }
      );
    }

    await prisma.kategoriKegiatan.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Sukses Menghapus kategori kegiatan" };
  } catch (error) {
    console.error("Delete kategori kegiatan error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus kategori kegiatan: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
};

export default kategoriKegiatanDelete;
