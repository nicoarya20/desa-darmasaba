import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK Responden.jenisKelaminId bersifat wajib (required),
// sehingga hard delete yang masih dipakai responden melempar P2003 -> 500.
// FK precheck memblokir lebih dulu; semua jalur SELALU Response.json.
export default async function jenisKelaminRespondenDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const respondenCount = await prisma.responden.count({
      where: { jenisKelaminId: id, isActive: true },
    });

    if (respondenCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Jenis kelamin responden tidak dapat dihapus karena masih digunakan oleh ${respondenCount} responden`,
        },
        { status: 400 }
      );
    }

    await prisma.jenisKelaminResponden.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Sukses Menghapus jenis kelamin responden" };
  } catch (error) {
    console.error("Delete jenis kelamin responden error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus jenis kelamin responden: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
