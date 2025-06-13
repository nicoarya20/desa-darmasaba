import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = Prisma.GalleryVideoGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        linkVideo: true;
    }
}>
async function galleryVideoCreate(context: Context) {
    const body = context.body as FormCreate;

    await prisma.galleryVideo.create({
        data: {
            name: body.name,
            deskripsi: body.deskripsi,
            linkVideo: body.linkVideo,
        },
    });
    return {
        success: true,
        message: "Success create gallery video",
        data: {
            ...body,
        },
    };
}
export default galleryVideoCreate;