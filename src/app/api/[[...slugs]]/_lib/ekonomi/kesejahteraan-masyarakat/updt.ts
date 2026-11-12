import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { Prisma } from "@prisma/client";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

type FormUpdate = {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  imageId: string; // Featured image
  imageIds?: string[]; // Multiple images for gallery
  linkVideo?: string; // YouTube link
};

async function kesejahteraanUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { judul, deskripsi, content, imageId, imageIds, linkVideo } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "ID tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const existing = await prisma.kesejahteraanMasyarakat.findUnique({
      where: { id },
      include: {
        image: true,
        images: true, // Include gallery images
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Program kesejahteraan tidak ditemukan",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Build update data
    const updateData: Prisma.KesejahteraanMasyarakatUpdateInput = {
      judul,
      deskripsi,
      content,
      image: imageId ? { connect: { id: imageId } } : { disconnect: true },
      linkVideo,
    };

    // Handle multiple images update
    if (imageIds !== undefined) {
      updateData.images = {
        set: [],
      };

      if (imageIds.length > 0) {
        updateData.images = {
          ...updateData.images,
          connect: imageIds.map((id) => ({ id })),
        };
      }
    }

    const updated = await prisma.kesejahteraanMasyarakat.update({
      where: { id },
      data: updateData,
      include: {
        image: true,
        images: true,
      },
    });

    // Gambar utama & galeri yang dilepas dipindah ke Sampah setelah update sukses.
    await removeReleasedFiles(
      "KesejahteraanMasyarakat",
      fileIds(existing.imageId, existing.images),
      fileIds(updated.imageId, updated.images),
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Program kesejahteraan berhasil diupdate",
        data: updated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error updating kesejahteraan:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate program kesejahteraan",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
export default kesejahteraanUpdate;
