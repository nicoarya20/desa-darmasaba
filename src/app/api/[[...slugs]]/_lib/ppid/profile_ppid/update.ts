import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.ProfilePPIDGetPayload<{
  select: {
    id: true;
    name: true;
    biodata: true;
    riwayat: true;
    pengalaman: true;
    unggulan: true;
    imageId: true;
  };
}>;
export default async function profilePPIDUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, biodata, riwayat, pengalaman, unggulan, imageId } = body;

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

    const existing = await prisma.profilePPID.findUnique({
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

    const updated = await prisma.profilePPID.update({
      where: {
        id,
      },
      data: {
        name,
        biodata,
        riwayat,
        pengalaman,
        imageId,
        unggulan,
      },
    });

    if (existing.imageId !== imageId) {
      const oldImage = existing.image;
      if (oldImage) {
        await removeStoredFile(oldImage, "ProfilePPID");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile PPID Berhasil Dibuat",
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
    console.error("Error updating profile PPID:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate profile PPID",
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
