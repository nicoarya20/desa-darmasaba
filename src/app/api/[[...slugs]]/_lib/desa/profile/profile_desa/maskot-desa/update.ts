import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

    // Gambar lama ke Sampah SETELAH update sukses; gambar yang dipakai lagi tetap aktif (masih dirujuk).
    for (const old of existing.images) {
      if (old.image) await removeStoredFile(old.image, "MaskotDesa");
    }

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
