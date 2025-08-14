import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PosyanduGetPayload<{
    select: {
        name: true;
        nomor: true;
        deskripsi: true;
        imageId: true;
        jadwalPelayanan: true;
    };
}>;
export default async function posyanduCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.posyandu.create({
        data: {
            name: body.name,
            nomor: body.nomor,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
            jadwalPelayanan: body.jadwalPelayanan,
        }
    })
    return {
        success: true,
        message: "Success create posyandu",
        data: {
            ...body,
        },
    };
}