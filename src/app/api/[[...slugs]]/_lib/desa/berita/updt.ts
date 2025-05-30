import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

type FormUpdate = Prisma.BeritaGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
    content: true;
    kategoriBeritaId: true;
    imageId: true;
  };
}>;

async function beritaUpdate(context: Context) {
  try {
    const id = context.params?.id as string; // ambil dari URL
    const body = (await context.body) as Omit<FormUpdate, "id">;
  
    const {
      judul,
      deskripsi,
      content,
      kategoriBeritaId,
      imageId,
    } = body;
  
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "ID tidak boleh kosong" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  
    const existing = await prisma.berita.findUnique({
      where: { id },
      include: {
        image: true,
        kategoriBerita: true,
      },
    });
  
    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, message: "Berita tidak ditemukan" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  
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
  
    const updated = await prisma.berita.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        content,
        kategoriBeritaId: kategoriBeritaId || null,
        imageId,
      },
    });
  
    return new Response(
      JSON.stringify({
        success: true,
        message: "Berita berhasil diupdate",
        data: updated,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error updating berita:", error); 
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate berita",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
  export default beritaUpdate;
