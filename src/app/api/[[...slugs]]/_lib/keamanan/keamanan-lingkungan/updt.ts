import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

    const updated = await prisma.keamananLingkungan.update({
      where: { id },
      data: {
        name,
        deskripsi,
        imageId,
      },
    });

    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        await removeStoredFile(oldImage, "KeamananLingkungan");
      }
    }

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
