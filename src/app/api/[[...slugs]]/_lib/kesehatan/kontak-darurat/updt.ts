import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.KontakDaruratGetPayload<{
    select: {
        id: true;
        name: true;
        deskripsi: true;
        imageId: true;
        whatsapp: true;
    }
}>
export default async function kontakDaruratUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {
            name,
            deskripsi,
            imageId,
            whatsapp,
        } = body;

        if(!id) {
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

        const existing = await prisma.kontakDarurat.findUnique({
            where: { id },
            include: {
                image: true,
            }
        })

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Kontak Darurat tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const updated = await prisma.kontakDarurat.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
                whatsapp,
            }
        })

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
                await removeStoredFile(oldImage, "KontakDarurat");
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Kontak Darurat berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating kontak darurat:", error); 
        return new Response(
            JSON.stringify({
                success: false,
                message: "Terjadi kesalahan saat mengupdate kontak darurat",
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
    