import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function maskotDesaUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as {
      judul: string;
      deskripsi: string;
      images: { label: string; imageId: string }[];
    };

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak boleh kosong",
        }),
        { status: 400 },
      );
    }

    const existing = await prisma.maskotDesa.findUnique({
      where: { id },
      include: { images: { include: { image: true } } },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Data tidak ditemukan",
        }),
        { status: 404 },
      );
    }

    // Hapus semua gambar lama (dan file-nya jika perlu)
    for (const old of existing.images) {
      try {
        if (old.imageId) {
          await prisma.fileStorage.delete({ where: { id: old.imageId } });
        }
        // opsional: hapus file dari disk juga kalau kamu simpan file fisik
        // await fs.unlink(path.join(old.image.path, old.image.name));
      } catch (error) {
        console.warn("Gagal hapus gambar lama:", error);
      }
    }

    // Update profile & re-create images
    const updated = await prisma.maskotDesa.update({
      where: { id },
      data: {
        judul: body.judul,
        deskripsi: body.deskripsi,
        images: {
          deleteMany: {},
          create: body.images.map((img) => ({
            label: img.label,
            imageId: img.imageId,
          })),
        },
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Data berhasil diperbarui",
        data: updated,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal update MaskotDesa:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat update",
      }),
      { status: 500 },
    );
  }
}
