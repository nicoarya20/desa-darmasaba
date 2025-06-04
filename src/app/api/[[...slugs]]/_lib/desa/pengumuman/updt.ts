import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.PengumumanGetPayload<{
    select: {
        id: true;
        judul: true;
        deskripsi: true;
        content: true;
        categoryPengumumanId: true;
        imageId: true;
    };
}>;

async function pengumumanUpdate(context: Context) {
    const body = context.body as FormUpdate;

    await prisma.pengumuman.update({
        where: { id: body.id },
        data: {
            judul: body.judul,
            deskripsi: body.deskripsi,
            content: body.content,
            categoryPengumumanId: body.categoryPengumumanId,
        },
    });

    return {
        success: true,
        message: "Success update pengumuman",
        data: {
            ...body,
        },
    };
}

export default pengumumanUpdate;

