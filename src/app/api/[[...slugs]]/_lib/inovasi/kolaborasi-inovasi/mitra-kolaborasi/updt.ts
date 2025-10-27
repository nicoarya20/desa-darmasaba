import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

type FormUpdate = {
    id: string;
    name: string;
    imageId: string;
}
export default async function mitraKolaborasiUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;
    
        const {
            name,
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
    
        const existing = await prisma.mitraKolaborasi.findUnique({
            where: {id},
            include: {
                image: true,
            }
        })
    
        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "mitra kolaborasi tidak ditemukan",
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
    
        const updated = await prisma.mitraKolaborasi.update({
            where: { id },
            data: {
                name,
                imageId,
            }
        })
    
        return new Response(JSON.stringify({
            success: true,
            message: "Mitra kolaborasi berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating mitra kolaborasi:", error); 
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate mitra kolaborasi",
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    }