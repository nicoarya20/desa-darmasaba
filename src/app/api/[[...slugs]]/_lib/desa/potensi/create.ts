import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.PotensiDesaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        kategoriId: true;
        imageId: true;
        content: true;
    }
}>
export default async function potensiDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.potensiDesa.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            kategoriId: body.kategoriId,
            imageId: body.imageId,
            content: body.content,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan potensi desa",
        data: {
            ...body,
        },
    };
}