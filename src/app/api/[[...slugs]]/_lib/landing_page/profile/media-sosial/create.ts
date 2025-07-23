import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  imageId: string;
  iconUrl: string;
};

export default async function mediaSosialCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    const result = await prisma.mediaSosial.create({
      data: {
        name: body.name,
        imageId: body.imageId,
        iconUrl: body.iconUrl,
      },
      include: {
        image: true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat media sosial",
      data: result,
    };
  } catch (error) {
    console.error("Error creating media sosial:", error);
    throw new Error(
      "Gagal membuat media sosial: " + (error as Error).message
    );
  }
}
