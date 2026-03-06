import { Context } from "elysia";
import prisma from "@/lib/prisma";

type FormUpdate = {
  judul: string;
  artis: string;
  deskripsi?: string;
  durasi: string;
  audioFileId: string;
  coverImageId: string;
  genre?: string;
  tahunRilis?: number | null;
};

async function musikUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const body = context.body as FormUpdate;

  try {
    const existing = await prisma.musikDesa.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Musik tidak ditemukan",
        },
      };
    }

    const updated = await prisma.musikDesa.update({
      where: { id },
      data: {
        judul: body.judul,
        artis: body.artis,
        deskripsi: body.deskripsi,
        durasi: body.durasi,
        audioFileId: body.audioFileId,
        coverImageId: body.coverImageId,
        genre: body.genre,
        tahunRilis: body.tahunRilis,
      },
    });

    return {
      success: true,
      message: "Musik berhasil diupdate",
      data: updated,
    };
  } catch (error) {
    console.error("Error updating musik:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Terjadi kesalahan saat mengupdate musik",
      },
    };
  }
}

export default musikUpdate;
