import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — konsisten dgn findMany
// yang memfilter isActive:true, dan mengikuti pola kanonik desa/banjar/del.ts.
// Hard delete sebelumnya melempar P2003 (FK Lembaga) yang diserialisasi Elysia
// jadi 500 plaintext -> frontend .json() meledak SyntaxError.
export default async function jenjangPendidikanDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Aturan bisnis: jangan sembunyikan jenjang yang masih dipakai lembaga aktif.
    const lembagaCount = await prisma.lembaga.count({
      where: { jenjangId: id, isActive: true },
    });

    if (lembagaCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Jenjang pendidikan tidak dapat dihapus karena masih digunakan oleh ${lembagaCount} lembaga`,
        },
        { status: 400 }
      );
    }

    await prisma.jenjangPendidikan.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Sukses Menghapus jenjang pendidikan" };
  } catch (error) {
    console.error("Delete jenjang pendidikan error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus jenjang pendidikan: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
