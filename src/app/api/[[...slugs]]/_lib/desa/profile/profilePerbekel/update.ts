import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

type FormUpdate = Prisma.ProfilPerbekelGetPayload<{
  select: {
    id: true;
    biodata: true;
    pengalaman: true;
    pengalamanOrganisasi: true;
    programUnggulan: true;
    imageId: true;
  };
}>;
export default async function profilePerbekelUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { biodata, pengalaman, pengalamanOrganisasi, programUnggulan, imageId } = body;

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

    const exisitng = await prisma.profilPerbekel.findUnique({
      where: {
        id,
      },
      include: {
        image: true,
      },
    });

    if (!exisitng) {
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

    if (exisitng.imageId !== imageId) {
      const oldImage = exisitng.image;
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

    const updated = await prisma.profilPerbekel.update({
        where: {id},
        data: {
            biodata,
            pengalaman,
            pengalamanOrganisasi,
            programUnggulan,
            imageId,
        }
    })

    return new Response(
        JSON.stringify({
            success: true,
            message: "Data berhasil diperbarui",
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
    console.error("Error updating profile Perbekel:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate profile Perbekel",
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
