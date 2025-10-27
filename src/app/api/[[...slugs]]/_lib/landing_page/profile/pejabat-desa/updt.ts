import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

type FormUpdate = Prisma.PejabatDesaGetPayload<{
  select: {
    id: true;
    name: true;
    position: true;
    imageId: true;
  };
}>;
export default async function pejabatDesaUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, position, imageId } = body;

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

    const existing = await prisma.pejabatDesa.findUnique({
      where: {
        id,
      },
      include: {
        image: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Data tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        try {
          const filePath = path.join(oldImage.path, oldImage.name);
          await fs.unlink(filePath);
          await prisma.fileStorage.delete({
            where: { id: oldImage.id },
          });
        } catch (error) {
          console.error("Gagal hapus gambar lama:", error);
        }
      }
    }

    const updated = await prisma.pejabatDesa.update({
      where: {
        id,
      },
      data: {
        name,
        position,
        imageId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pejabat Desa Berhasil Dibuat",
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
    console.error("Error updating pejabat desa:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate pejabat desa",
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
