import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

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
    
        if (existing.imageId && existing.imageId !== imageId) {
        const oldImage = existing.image;
        if (oldImage) {
            try {
                await minio.removeObject(MINIO_BUCKET, `${oldImage.path}/${oldImage.name}`);
                await prisma.fileStorage.delete({
                    where: { id: oldImage.id },
                });
            } catch (error) {
                console.error("Gagal hapus gambar lama:", error);
            }
        }
        }
    
        const updated = await prisma.infoTekno.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
            }
        })
    
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