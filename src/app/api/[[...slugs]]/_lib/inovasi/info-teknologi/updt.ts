import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

type FormUpdate = Prisma.InfoTeknoGetPayload<{
    select: {
        id: true,
        name: true,
        deskripsi: true
        imageId: true
    }
}>
export default async function infoTeknoUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;
    
        const {
            name,
            deskripsi,
            imageId
        } = body;
    
        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak ditemukan",
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    
        const existing = await prisma.infoTekno.findUnique({
            where: {id},
            include: {
                image: true,
            }
        })
    
        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Info tekno tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
    
        const updated = await prisma.infoTekno.update({
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
            await removeStoredFile(oldImage, "InfoTekno");
        }
        }
    
        return new Response(JSON.stringify({
            success: true,
            message: "Info teknologi berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating info teknologi:", error); 
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate info teknologi",
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    }