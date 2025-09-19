import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

type FormUpdate = Prisma.PegawaiPPIDGetPayload<{
  select: {
    id: true;
    namaLengkap: true;
    gelarAkademik: true;
    tanggalMasuk: true;
    email: true;
    imageId: true;
    telepon: true;
    alamat: true;
    posisiId: true;
    isActive: boolean;
  };
}>;
export default async function pegawaiUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    body.isActive = String(body.isActive).toLowerCase() === 'true';
    
    const {
      namaLengkap,
      gelarAkademik,
      tanggalMasuk,
      email,
      telepon,
      imageId,
      alamat,
      posisiId,
      isActive,
    } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak boleh kosong",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const existing = await prisma.pegawaiPPID.findUnique({
      where: {
        id,
      },
      include: {
        image: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Data tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        try {
          const filePath = path.join(oldImage.path, oldImage.name);
          await fs.unlink(filePath);
          await prisma.fileStorage.delete({
            where: { id: oldImage.id },
          });
        } catch (error) {
          console.error("Gagal hapus gambar lama:", error);
        }
      }
    }

    const updated = await prisma.pegawaiPPID.update({
      where: {
        id,
      },
      data: {
        namaLengkap,
        gelarAkademik,
        tanggalMasuk,
        email,
        imageId,
        telepon,
        alamat,
        posisiId,
        isActive,
      },
      include: {
        image: true,
        posisi: true
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile PPID Berhasil Dibuat",
        data: updated,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating profile PPID:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate profile PPID",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
