import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.PuskesmasGetPayload<{
  select: {
    id: true;
    name: true;
    alamat: true;
    jam: true;
    imageId: true;
    kontak: true;
  };
}>;

export default async function puskesmasUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, alamat, jam, imageId, kontak } = body;

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

    const existing = await prisma.puskesmas.findUnique({
      where: { id },
      include: {
        image: true,
        kontak: true,
        jam: true,
      },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Puskesmas tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await prisma.jamOperasional.update({
      where: { id: existing.jamId },
      data: {
        workDays: jam.workDays,
        weekDays: jam.weekDays,
        holiday: jam.holiday,
      },
    });

    await prisma.kontakPuskesmas.update({
      where: { id: existing.kontakId },
      data: {
        kontakPuskesmas: kontak.kontakPuskesmas,
        email: kontak.email,
        facebook: kontak.facebook,
        kontakUGD: kontak.kontakUGD,
      },
    });

    const updated = await prisma.puskesmas.update({
      where: { id },
      data: {
        name,
        alamat,
        jamId: jam.id,
        imageId,
        kontakId: kontak.id,
      },
    });

    if (existing.imageId && existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        await removeStoredFile(oldImage, "Puskesmas");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success update puskesmas",
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
          "Gagal update puskesmas: " +
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
