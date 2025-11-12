import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GalleryFotoGetPayload<{
    select: {
        name: true;
        imagesId: true;
        deskripsi: true;
        
    };
}>;
async function galleryFotoCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.galleryFoto.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            imagesId: body.imagesId,
        },
    });
    return {
        success: true,
        message: "Sukses menambahkan gallery foto",
        data: {
            ...body,
        },
    };
}

export default galleryFotoCreate
