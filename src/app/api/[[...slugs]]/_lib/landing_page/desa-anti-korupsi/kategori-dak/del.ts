import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK DesaAntiKorupsi.kategoriId bersifat wajib (required),
// sehingga hard delete kategori ber-anak melempar P2003 -> 500. FK precheck
// memblokir lebih dulu; semua jalur SELALU Response.json (tak throw telanjang).
export default async function kategoriDesaAntiKorupsiDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const desaAntiKorupsiCount = await prisma.desaAntiKorupsi.count({
      where: { kategoriId: id, isActive: true },
    });

    if (desaAntiKorupsiCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Kategori desa anti korupsi tidak dapat dihapus karena masih digunakan oleh ${desaAntiKorupsiCount} data`,
        },
        { status: 400 }
      );
    }

    await prisma.kategoriDesaAntiKorupsi.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: "Berhasil menghapus kategori desa anti korupsi",
    };
  } catch (error) {
    console.error("Delete kategori desa anti korupsi error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus kategori desa anti korupsi: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
