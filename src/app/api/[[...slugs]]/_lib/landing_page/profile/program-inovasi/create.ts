import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  description: string;
  imageId: string;
  link: string;
};

export default async function programInovasiCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.name) {
    throw new Error("name wajib diisi");
  }

  try {
    const result = await prisma.programInovasi.create({
      data: {
        name: body.name,
        description: body.description,
        imageId: body.imageId,
        link: body.link,
      },
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat program inovasi",
      data: result,
    };
  } catch (error) {
    console.error("Error creating program inovasi:", error);
    throw new Error(
      "Gagal membuat program inovasi: " + (error as Error).message
    );
  }
}
