import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.GalleryVideoGetPayload<{
    select: {
        id: true;
        name: true;
        deskripsi: true;
        linkVideo: true;
    }
}>;

async function galleryVideoUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {
            name,
            deskripsi,
            linkVideo,
        } = body;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak boleh kosong",
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const existing = await prisma.galleryVideo.findUnique({
            where: {id}
        })

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Gallery video tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        const updated = await prisma.galleryVideo.update({
            where: {id},
            data: {
                name,
                deskripsi,
                linkVideo,
            }
        })

        return new Response(JSON.stringify({
            success: true,
            message: "Gallery video berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Update error:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Gagal mengupdate gallery video: " + (error instanceof Error ? error.message : 'Unknown error'),
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        }); 
    }
}
export default galleryVideoUpdate;
