import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.InfoWabahPenyakitGetPayload<{
    select: {
        id: true;
        name: true;
        deskripsiSingkat: true;
        deskripsiLengkap: true;
        imageId: true;
    }
}>

export default async function infoWabahPenyakitUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {
            name,
            deskripsiSingkat,
            deskripsiLengkap,
            imageId,
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

        const existing = await prisma.infoWabahPenyakit.findUnique({
            where: { id },
            include: {
                image: true,
            }
        })

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Info wabah penyakit tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }

        const updated = await prisma.infoWabahPenyakit.update({
            where: { id },
            data: {
                name,
                deskripsiSingkat,
                deskripsiLengkap,
                imageId,
            }
        })

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
                await removeStoredFile(oldImage, "InfoWabahPenyakit");
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Info wabah penyakit berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating info wabah penyakit:", error); 
        return new Response(
            JSON.stringify({
                success: false,
                message: "Terjadi kesalahan saat mengupdate info wabah penyakit",
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}