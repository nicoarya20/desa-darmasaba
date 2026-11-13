import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.PerbekelDariMasaKeMasaGetPayload<{
  select: {
    id: true;
    nama: true;
    periode: true;
    imageId: true;
    daerah: true;
  };
}>;

export default async function profileMantanPerbekelUpdate(context: Context) {
  try {
    const id = context.params?.id;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { nama, periode, imageId, daerah } = body;

    if (!id) {
      return {
        success: false,
        message: "ID tidak diberikan",
      };
    }

    const existing = await prisma.perbekelDariMasaKeMasa.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        message: "Profile mantan perbekel tidak ditemukan",
      };
    }

    const updated = await prisma.perbekelDariMasaKeMasa.update({
      where: { id },
      data: {
        nama,
        periode,
        imageId,
        daerah,
      },
    });

    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        await removeStoredFile(oldImage, "PerbekelDariMasaKeMasa");
      }
    }

    return {
      success: true,
      message: "Success update profile mantan perbekel",
      data: updated,
    };
  } catch (error) {
    console.error("Error updating profile mantan perbekel:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengupdate profile mantan perbekel",
    };
  }
}
