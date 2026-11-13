import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.GalleryFotoGetPayload<{
  select: {
    id: true;
    name: true;
    deskripsi: true;
    imagesId: true;
  };
}>;

async function galleryFotoUpdate(context: Context) {
  try {
    const id = context.params?.id;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, deskripsi, imagesId } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "ID tidak diberikan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existing = await prisma.galleryFoto.findUnique({
      where: { id },
      include: {
        imageGalleryFoto: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Gallery foto tidak ditemukan",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const updated = await prisma.galleryFoto.update({
      where: { id },
      data: {
        name,
        deskripsi,
        imagesId,
      },
    });

    if (existing.imagesId && existing.imagesId !== imagesId) {
      const oldImage = existing.imageGalleryFoto;
      if (oldImage) {
        await removeStoredFile(oldImage, "GalleryFoto");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success update gallery foto",
        data: updated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating gallery foto:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate gallery foto",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export default galleryFotoUpdate;
