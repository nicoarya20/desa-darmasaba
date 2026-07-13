import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Kematian adalah data mentah, bukan kategori-induk. FK justru ada di sisi
// DataKematian_Kelahiran (statistik) yang menunjuk ke sini — dan bersifat wajib
// (required), sehingga delete polos row yang masih ditunjuk statistik melempar
// P2003 -> 500. Sesuai aturan bisnis: "hapus ya hapus", statistik menyesuaikan.
// Maka record statistik pasangannya ikut dibereskan dalam satu transaksi agar
// atomik (tak ada statistik yatim), dan semua jalur SELALU Response.json.
export default async function kematianDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Hapus statistik yang menunjuk row ini dulu (buang FK), baru row-nya —
    // atomik, sehingga jumlah kematian di statistik otomatis menyesuaikan.
    await prisma.$transaction([
      prisma.dataKematian_Kelahiran.deleteMany({ where: { kematianId: id } }),
      prisma.kematian.delete({ where: { id } }),
    ]);

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
