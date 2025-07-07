/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdatePegawai = {
  id: string;
  namaLengkap?: string;
  gelarAkademik?: string;
  imageId: string;
  tanggalMasuk?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  posisiId?: string;
  isActive?: boolean;
};

export default async function pegawaiUpdate(context: Context) {
  const body = await context.body as FormUpdatePegawai;

  if (!body?.id) {
    return {
      success: false,
      message: "ID pegawai wajib diisi",
    };
  }

  if (typeof body.isActive !== 'boolean') {
    body.isActive = true; // fallback
  }
  

  try {
    const updated = await prisma.pegawai.update({
      where: { id: body.id },
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
        updatedAt: new Date(),
      },
      include: {
        image: true,
        posisi: true,
      }
    });

    return {
      success: true,
      message: "Pegawai berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("Error update pegawai:", error);
    return {
      success: false,
      message: "Gagal memperbarui data pegawai",
      error: error.message,
    };
  }
}
