import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { susunBeritaUpdate, type BeritaBody } from "@/lib/berita-data";
import { parseTanggalTerbit } from "@/lib/tanggal-terbit";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

async function beritaUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as BeritaBody;

    const { imageId } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "ID tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validasi sebelum menyentuh DB/MinIO: tanggal salah tidak boleh ikut menghapus gambar lama.
    const tanggal = parseTanggalTerbit(body.tanggalTerbit);
    if (!tanggal.ok) {
      return new Response(
        JSON.stringify({ success: false, message: tanggal.message }),
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

    const updated = await prisma.berita.update({
      where: { id },
      data: susunBeritaUpdate(body, tanggal.data),
      include: {
        image: true,
        images: true,
        kategoriBerita: true,
      },
    });

    // Delete old featured image if changed
    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        await removeStoredFile(oldImage, "Berita");
      }
    }

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
