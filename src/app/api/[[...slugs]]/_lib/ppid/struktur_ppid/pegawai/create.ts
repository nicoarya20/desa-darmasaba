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
  isActive?: boolean;
};

export default async function pegawaiCreate(context: Context) {
  const body = await context.body as FormCreatePegawai;

  if (!body || typeof body !== 'object') {
    return {
      success: false,
      message: "Data tidak valid",
    };
  }

  if (!body.namaLengkap || !body.posisiId || !body.imageId) {
    return {
      success: false,
      message: "Nama lengkap, posisi, dan gambar wajib diisi",
    };
  }

  try {
    const pegawai = await prisma.pegawaiPPID.create({
      data: {
        namaLengkap: body.namaLengkap,
        gelarAkademik: body.gelarAkademik,
        imageId: body.imageId,
        tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : undefined,
        email: body.email,
        telepon: body.telepon,
        alamat: body.alamat,
        posisiId: body.posisiId,
        isActive: body.isActive ?? true, // default true kalau tidak dikirim

      },
    });

    return {
      success: true,
      message: "Berhasil menambahkan pegawai",
      data: pegawai,
    };
  } catch (error: any) {
    console.error("Error creating pegawai:", error);
    
    if (error.code === "P2002") {
      // Cek field mana yang duplicate
      const target = error.meta?.target?.[0];
      let message = "Data sudah ada";
      
      if (target === 'email') message = "Email sudah digunakan";
      else if (target === 'telepon') message = "Nomor telepon sudah digunakan";
      
      return {
        success: false,
        message,
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
