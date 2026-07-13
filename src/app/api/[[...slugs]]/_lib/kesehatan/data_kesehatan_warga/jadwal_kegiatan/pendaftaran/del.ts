import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — mengikuti pola kanonik
// desa/banjar/del.ts. FK precheck memblokir bila masih dipakai JadwalKegiatan
// aktif; semua jalur SELALU Response.json (tak throw telanjang) agar frontend
// .json() tak meledak SyntaxError saat error.
export default async function pendaftaranJadwalKegiatanDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    const jadwalCount = await prisma.jadwalKegiatan.count({
      where: { pendaftaranJadwalKegiatanId: id, isActive: true },
    });

    if (jadwalCount > 0) {
      return Response.json(
        {
          success: false,
          message: `Pendaftaran jadwal kegiatan tidak dapat dihapus karena masih digunakan oleh ${jadwalCount} jadwal kegiatan`,
        },
        { status: 400 }
      );
    }

    await prisma.pendaftaranJadwalKegiatan.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: "Pendaftaran jadwal kegiatan berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete pendaftaran jadwal kegiatan error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus pendaftaran jadwal kegiatan: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
