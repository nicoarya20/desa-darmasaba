/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreatePegawai = {
  namaLengkap: string;
  gelarAkademik?: string;
  imageId: string;
  tanggalMasuk?: string; // Kirim dari frontend dalam format ISO (ex: '2025-07-04')
  email?: string;
  telepon?: string;
  alamat?: string;
  posisiId: string;
};

export default async function pegawaiCreate(context: Context) {
  const body = await context.body as FormCreatePegawai;

  if (!body || !body.namaLengkap || !body.posisiId) {
    return {
      success: false,
      message: "namaLengkap dan posisiId wajib diisi",
    };
  }

  try {
    const pegawai = await prisma.pegawai.create({
      data: {
        namaLengkap: body.namaLengkap,
        gelarAkademik: body.gelarAkademik,
        imageId: body.imageId,
        tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : undefined,
        email: body.email,
        telepon: body.telepon,
        alamat: body.alamat,
        posisiId: body.posisiId,
        // aktif, createdAt, updatedAt otomatis by Prisma default
      },
    });

    return {
      success: true,
      message: "Berhasil menambahkan pegawai",
      data: pegawai,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Email sudah digunakan",
      };
    }

    console.error("Gagal menambahkan pegawai:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat pegawai",
      error: error.message,
    };
  }
}
