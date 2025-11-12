import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
    nama: string;
    periode: string;
    imageId: string;
    daerah: string;
}

export default async function profileMantanPerbekelCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.perbekelDariMasaKeMasa.create({
        data: {
            nama: body.nama,
            periode: body.periode,
            imageId: body.imageId,
            daerah: body.daerah,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan profile mantan perbekel",
        data: {
            ...body,
        },
    };
}