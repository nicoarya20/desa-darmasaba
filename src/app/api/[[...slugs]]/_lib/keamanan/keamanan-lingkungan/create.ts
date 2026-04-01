import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.KeamananLingkunganGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
    };
}>;
async function createKeamananLingkungan(context: Context) {
    const body = context.body as FormCreate;

    await prisma.keamananLingkungan.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imageId: body.imageId,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan keamanan lingkungan",
        data: {
            ...body,
        },
    };
}
export default createKeamananLingkungan