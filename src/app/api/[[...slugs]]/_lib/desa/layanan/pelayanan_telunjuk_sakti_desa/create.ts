import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.PelayananTelunjukSaktiDesaGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        link: true;
    };
}>;
export default async function pelayananTelunjukSaktiDesaCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.pelayananTelunjukSaktiDesa.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            link: body.link,
        },
    });
    return {
        success: true,
        message: "Success create pelayanan telunjuk sakti desa",
        data: {
            ...body,
        },
    };
}