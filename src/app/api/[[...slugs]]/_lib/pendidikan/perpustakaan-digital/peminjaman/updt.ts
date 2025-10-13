import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
  nama: string;
  noTelp: string;
  alamat: string;
  bukuId: string;
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali?: string;
  catatan?: string;
  status?: 'Dipinjam' | 'Dikembalikan' | 'Terlambat' | 'Dibatalkan';
};

export default async function dataPerpustakaanUpdate(context: Context) {
  const body = (await context.body) as FormUpdate;
  const id = context.params.id as string;

  try {
    const result = await prisma.peminjamanBuku.update({
      where: { id },
      data: {
        nama: body.nama,
        noTelp: body.noTelp,
        alamat: body.alamat,
        bukuId: body.bukuId,
        tanggalPinjam: body.tanggalPinjam,
        batasKembali: body.batasKembali,
        tanggalKembali: body.tanggalKembali,
        catatan: body.catatan,
        status: body.status,
      },
      include: {
        buku: true,
      }
    });
    return {
      success: true,
      message: "Berhasil mengupdate data peminjaman buku",
      data: result,
    };
  } catch (error) {
    console.error("Error updating data peminjaman buku:", error);
    throw new Error(
      "Gagal mengupdate data peminjaman buku: " + (error as Error).message
    );
  }
}
