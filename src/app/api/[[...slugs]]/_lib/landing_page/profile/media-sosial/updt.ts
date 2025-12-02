/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdateMediaSosial = {
  name?: string;
  imageId?: string;
  iconUrl?: string;
  icon?: string;
};

export default async function mediaSosialUpdate(context: Context) {
  const body = context.body as FormUpdateMediaSosial;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID media sosial wajib diisi",
    };
  }

  // 🚨 Tambahkan validasi di sini
  if (!body.name || body.name.trim().length < 3) {
    return {
      success: false,
      message: "Nama media sosial minimal 3 karakter",
    };
  }

  if (!body.iconUrl || body.iconUrl.trim().length < 3) {
    return {
      success: false,
      message: "Icon URL minimal 3 karakter",
    };
  }

  try {
    const updated = await prisma.mediaSosial.update({
      where: { id },
      data: {
        name: body.name,
        imageId: body.imageId || null, // pastikan null jika kosong
        iconUrl: body.iconUrl,
        icon: body.icon || null, // pastikan null jika kosong
      },
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "Media sosial berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    console.error("❌ Error update media sosial:", error);
    return {
      success: false,
      message: "Gagal memperbarui data media sosial",
      error: error.message,
    };
  }
}
