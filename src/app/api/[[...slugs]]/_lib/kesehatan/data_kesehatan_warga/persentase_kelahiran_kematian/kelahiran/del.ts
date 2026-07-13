import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK DataKematian_Kelahiran.kelahiranId bersifat wajib
// (required), sehingga hard delete kelahiran ber-anak melempar P2003 -> 500.
// FK precheck memblokir lebih dulu; semua jalur SELALU Response.json.
export default async function kelahiranDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const dataCount = await prisma.dataKematian_Kelahiran.count({
      where: { kelahiranId: id, isActive: true },
    });

    if (dataCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Data kelahiran tidak dapat dihapus karena masih digunakan oleh ${dataCount} data statistik`,
        },
        { status: 400 }
      );
    }

    await prisma.kelahiran.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Data berhasil dihapus" };
  } catch (error) {
    console.error("Delete kelahiran error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus data kelahiran: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
