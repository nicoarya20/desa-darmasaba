import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

type FormUpdate = Prisma.DesaDigitalGetPayload<{
    select: {
        id: true,
        name: true,
        deskripsi: true
        imageId: true
    }
}>
export default async function desaDigitalUpdate(context: Context) {
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
    
        const existing = await prisma.desaDigital.findUnique({
            where: {id},
            include: {
                image: true,
            }
        })
    
        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Desa digital tidak ditemukan",
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
                const filePath = path.join(oldImage.path, oldImage.name);
                await fs.unlink(filePath);
                await prisma.fileStorage.delete({
                    where: { id: oldImage.id },
                });
            } catch (error) {
                console.error("Gagal hapus gambar lama:", error);
            }
        }
        }
    
        const updated = await prisma.desaDigital.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
            }
        })
    
        return new Response(JSON.stringify({
            success: true,
            message: "Desa digital berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating desa digital:", error); 
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate desa digital",
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    }