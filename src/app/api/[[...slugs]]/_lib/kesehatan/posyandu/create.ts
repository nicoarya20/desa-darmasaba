import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = {
    name: string;
    nomor: string;
    deskripsi: string;
    imageId: string;
    jadwalPelayanan: string;
    banjarId?: string;
};
export default async function posyanduCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.posyandu.create({
        data: {
            name: body.name,
            nomor: body.nomor,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
            jadwalPelayanan: body.jadwalPelayanan,
            banjarId: body.banjarId || null,
        }
    })
    return {
        success: true,
        message: "Sukses menambahkan posyandu",
        data: {
            ...body,
        },
    };
}