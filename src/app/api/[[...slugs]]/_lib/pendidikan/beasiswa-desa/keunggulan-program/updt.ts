import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
    judul: string;
    deskripsi: string;
}

export default async function keunggulanProramUpdate(context: Context){
    const id = context.params.id as string;
  const body = context.body as FormUpdate;

  try {
    if (typeof id !== "string") {
      return {
        success: false,
        message: "ID is required",
      };
    }

    const data = await prisma.keunggulanProgram.update({
      where: { id },
      data: {
        judul: body.judul,
        deskripsi: body.deskripsi,
      },
    });

    if (!data) {
        return {
          success: false,
          message: "Data not found",
        };
      }

    return {
      success: true,
      message: "Success update keunggulan program",
      data,
    };
  } catch (error) {
    console.error("Gagal update data keunggulan program:", error);
    throw new Error("Gagal update data keunggulan program: " + (error as Error).message);
  }
}