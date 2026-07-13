import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK Responden.kelompokUmurId bersifat wajib (required),
// sehingga hard delete yang masih dipakai responden melempar P2003 -> 500.
// FK precheck memblokir lebih dulu; semua jalur SELALU Response.json.
export default async function umurRespondenDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const respondenCount = await prisma.responden.count({
      where: { kelompokUmurId: id, isActive: true },
    });

    if (respondenCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Umur responden tidak dapat dihapus karena masih digunakan oleh ${respondenCount} responden`,
        },
        { status: 400 }
      );
    }

    await prisma.umurResponden.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Sukses Menghapus umur responden" };
  } catch (error) {
    console.error("Delete umur responden error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus umur responden: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
