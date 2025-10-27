import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  jumlah: string;
  imageId: string;
  fileId: string;
};

export default async function apbdesCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    const result = await prisma.aPBDes.create({
      data: {
        name: body.name,
        jumlah: body.jumlah,
        imageId: body.imageId,
        fileId: body.fileId,
      },
      include: {
        image: true,
        file: true,
      },
    });
    return {
      success: true,
      message: "Berhasil membuat APB Des",
      data: result,
    };
  } catch (error) {
    console.error("Error creating APB Des:", error);
    throw new Error("Gagal membuat APB Des: " + (error as Error).message);
  }
}
