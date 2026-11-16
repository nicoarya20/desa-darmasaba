import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  noTelp: string;
  alamat: string;
  bukuId: string;
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali?: string;
  catatan?: string;
}

export default async function peminjamanBukuCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  try {
    const result = await prisma.peminjamanBuku.create({
      data: {
        nama: body.nama,
        noTelp: body.noTelp,
        alamat: body.alamat,
        bukuId: body.bukuId,
        tanggalPinjam: body.tanggalPinjam,
        batasKembali: body.batasKembali,
        tanggalKembali: body.tanggalKembali,
        catatan: body.catatan,
      },
      select: { id: true },
    });
    // Hanya id: endpoint form publik, jangan gemakan nama/telepon/alamat peminjam ke respons.
    return {
      success: true,
      message: "Berhasil membuat peminjaman buku",
      data: { id: result.id },
    };
  } catch (error) {
    console.error("Error creating peminjaman buku:", error);
    throw new Error("Gagal membuat peminjaman buku: " + (error as Error).message);
  }
}