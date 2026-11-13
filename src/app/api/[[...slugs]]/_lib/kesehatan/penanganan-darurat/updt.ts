import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.PenangananDaruratGetPayload<{
    select: {
        id: true;
        name: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function penangananDaruratUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {
            name,
            deskripsi,
            imageId,
        } = body;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak boleh kosong",
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const existing = await prisma.penangananDarurat.findUnique({
            where: { id },
            include: {
                image: true,
            }
        })

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Penanganan darurat tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const updated = await prisma.penangananDarurat.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
            }
        })

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
                await removeStoredFile(oldImage, "PenangananDarurat");
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Penanganan darurat berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating penanganan darurat:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Gagal mengupdate penanganan darurat: " + (error instanceof Error ? error.message : 'Unknown error'),
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}