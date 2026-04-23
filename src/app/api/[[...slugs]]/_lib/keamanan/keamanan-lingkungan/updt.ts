import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

type FormUpdate = Prisma.KeamananLingkunganGetPayload<{
  select: {
    id: true;
    name: true;
    deskripsi: true;
    imageId: true;
  };
}>;
export default async function updateKeamananLingkungan(context: Context) {
  try {
    const id = context.params?.id;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, deskripsi, imageId } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak diberikan",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const existing = await prisma.keamananLingkungan.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Keamanan lingkungan tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        try {
          await minio.removeObject(MINIO_BUCKET, `${oldImage.path}/${oldImage.name}`);
          await prisma.fileStorage.delete({
            where: { id: oldImage.id },
          });
        } catch (err) {
          console.error("Gagal hapus gambar lama:", err);
        }
      }
    }

    const updated = await prisma.keamananLingkungan.update({
      where: { id },
      data: {
        name,
        deskripsi,
        imageId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success update keamanan lingkungan",
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
    console.error("Error updating keamanan lingkungan:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate keamanan lingkungan",
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
