import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormUpdate = Prisma.PencegahanKriminalitasGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
    deskripsiSingkat: true;
    linkVideo: true;
  };
}>;
export default async function pencegahanKriminalitasUpdate(context: Context) {
  try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { judul, deskripsi, deskripsiSingkat, linkVideo } = body;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak diberikan",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const existing = await prisma.pencegahanKriminalitas.findUnique({
      where: { id },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Pencegahan kriminalitas tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const updated = await prisma.pencegahanKriminalitas.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        deskripsiSingkat,
        linkVideo,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Success update pencegahan kriminalitas",
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
        message: "Failed update pencegahan kriminalitas",
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
