/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdatePrestasiDesa = {
  name?: string;
  imageId?: string;
  deskripsi?: string;
  kategoriId?: string;
};

export default async function prestasiDesaUpdate(context: Context) {
  const body = context.body as FormUpdatePrestasiDesa;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID Prestasi Desa wajib diisi",
    };
  }

  try {
    // Cegah duplikasi: tolak jika nama bentrok dengan record lain (case-insensitive)
    if (body.name) {
      const duplikat = await prisma.prestasiDesa.findFirst({
        where: {
          name: { equals: body.name, mode: "insensitive" },
          NOT: { id },
        },
        select: { id: true },
      });
      if (duplikat) {
        context.set.status = 409;
        return {
          success: false,
          message: `Prestasi "${body.name}" sudah terdaftar. Gunakan nama lain atau ubah data yang sudah ada.`,
        };
      }
    }

    const updated = await prisma.prestasiDesa.update({
      where: { id },
      data: {
        name: body.name,
        imageId: body.imageId,
        deskripsi: body.deskripsi,
        kategoriId: body.kategoriId,
      },
      include: {
        image: true,
        kategori: true,
      },
    });

    return {
      success: true,
      message: "Prestasi Desa berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update Prestasi Desa:", error);
    return {
      success: false,
      message: "Gagal memperbarui data Prestasi Desa",
      error: error.message,
    };
  }
}
