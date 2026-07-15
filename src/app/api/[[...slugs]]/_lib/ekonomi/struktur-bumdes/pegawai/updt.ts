/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdatePegawai = {
  id: string;
  namaLengkap?: string;
  gelarAkademik?: string;
  imageId?: string;
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

  body.isActive = String(body.isActive).toLowerCase() === 'true';

  try {
    const updated = await prisma.pegawaiBumDes.update({
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
    // Ganti email ke email pegawai lain yang sudah ada (@unique) → 409
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Error update pegawai:", error);
    return {
      success: false,
      message: "Gagal memperbarui data pegawai",
      error: error.message,
    };
  }
}
