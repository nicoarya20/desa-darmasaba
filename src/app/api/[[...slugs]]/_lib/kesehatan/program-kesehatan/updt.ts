import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

type FormUpdate = Prisma.ProgramKesehatanGetPayload<{
  select: {
    id: true;
    name: true;
    deskripsiSingkat: true;
    deskripsi: true;
    imageId: true;
  };
}>;
export default async function programKesehatanUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, deskripsiSingkat, deskripsi, imageId } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak boleh kosong",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const existing = await prisma.programKesehatan.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Program kesehatan tidak ditemukan",
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

    const updated = await prisma.programKesehatan.update({
      where: { id },
      data: {
        name,
        deskripsiSingkat,
        deskripsi,
        imageId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success update program kesehatan",
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
    console.error("Update error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message:
          "Gagal mengupdate program kesehatan: " +
          (error instanceof Error ? error.message : "Unknown error"),
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
