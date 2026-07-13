import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK DataKematian_Kelahiran.kematianId bersifat wajib
// (required), sehingga hard delete kematian ber-anak melempar P2003 -> 500.
// FK precheck memblokir lebih dulu; semua jalur SELALU Response.json.
export default async function kematianDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const dataCount = await prisma.dataKematian_Kelahiran.count({
      where: { kematianId: id, isActive: true },
    });

    if (dataCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Data kematian tidak dapat dihapus karena masih digunakan oleh ${dataCount} data statistik`,
        },
        { status: 400 }
      );
    }

    await prisma.kematian.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Data berhasil dihapus" };
  } catch (error) {
    console.error("Delete kematian error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus data kematian: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
