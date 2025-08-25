import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  imageId: string;
};

export default async function mitraKolaborasiCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.mitraKolaborasi.create({
        data: {
            name: body.name,
            imageId: body.imageId,
        },
    });

    return {
        success: true,
        message: "Berhasil membuat mitra kolaborasi",
        data: {
            ...body,
        },
    };
}
