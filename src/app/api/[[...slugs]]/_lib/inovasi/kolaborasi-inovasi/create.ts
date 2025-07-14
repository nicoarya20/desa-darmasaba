import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreateKolaborasiInovasi = {
    name: string;
    tahun: number;
    slug: string;
    deskripsi: string;
    kolaborator: string;
    imageId: string;
}

export default async function kolaborasiInovasiCreate(context: Context){
    const body = context.body as FormCreateKolaborasiInovasi;

    await prisma.kolaborasiInovasi.create({
        data: {
            name: body.name,
            tahun: body.tahun,
            slug: body.slug,
            deskripsi: body.deskripsi,
            kolaborator: body.kolaborator,
            imageId: body.imageId,
        }
    })

    return {
        success: true,
        message: "Success create kolaborasi inovasi",
        data: {
            ...body,
        }
    }
}