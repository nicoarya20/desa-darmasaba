import prisma from "@/lib/prisma";
import type { Context } from "elysia";

type FormCreate = {
  name: string;
  jumlah: string;
  imageId: string;
};

export default async function sdgsDesaCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    const result = await prisma.sdgsDesa.create({
      data: {
        name: body.name,
        jumlah: body.jumlah,
        imageId: body.imageId,
      },
      include: {
        image: true,
      },
    });
    return {
      success: true,
      message: "Berhasil membuat SDGS Desa",
      data: result,
    };
  } catch (error) {
    console.error("Error creating SDGS Desa:", error);
    throw new Error("Gagal membuat SDGS Desa: " + (error as Error).message);
  }
}
