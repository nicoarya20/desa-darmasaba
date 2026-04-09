import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

type FormUpdate = {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  kategoriBeritaId: string;
  imageId: string; // Featured image
  imageIds?: string[]; // Multiple images for gallery
  linkVideo?: string; // YouTube link
};

async function beritaUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { judul, deskripsi, content, kategoriBeritaId, imageId, imageIds, linkVideo } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "ID tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const existing = await prisma.berita.findUnique({
      where: { id },
      include: {
        image: true,
        images: true, // Include gallery images
        kategoriBerita: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, message: "Berita tidak ditemukan" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Delete old featured image if changed
    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        try {
          const filePath = path.join(oldImage.path, oldImage.name);
          await fs.unlink(filePath);
          await prisma.fileStorage.delete({
            where: { id: oldImage.id },
          });
        } catch (err) {
          console.error("Gagal hapus gambar lama:", err);
        }
      }
    }

    // Build update data
    const updateData: Prisma.BeritaUpdateInput = {
      judul,
      deskripsi,
      content,
      kategoriBerita: kategoriBeritaId ? { connect: { id: kategoriBeritaId } } : { disconnect: true },
      image: imageId ? { connect: { id: imageId } } : { disconnect: true },
      linkVideo,
    };

    // Handle multiple images update
    if (imageIds !== undefined) {
      // Disconnect all existing images first
      updateData.images = {
        set: [],
      };
      
      // Connect new images if provided
      if (imageIds.length > 0) {
        updateData.images = {
          ...updateData.images,
          connect: imageIds.map((id) => ({ id })),
        };
      }
    }

    const updated = await prisma.berita.update({
      where: { id },
      data: updateData,
      include: {
        image: true,
        images: true,
        kategoriBerita: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Berita berhasil diupdate",
        data: updated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error updating berita:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate berita",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
export default beritaUpdate;
