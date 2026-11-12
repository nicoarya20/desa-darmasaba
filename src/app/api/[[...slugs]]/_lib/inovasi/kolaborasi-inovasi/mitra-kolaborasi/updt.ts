import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

        const updated = await prisma.mitraKolaborasi.update({
            where: { id },
            data: {
                name,
                imageId,
            }
        })

        if (existing.imageId && existing.imageId !== imageId) {
        const oldImage = existing.image;
        if (oldImage) {
            await removeStoredFile(oldImage, "MitraKolaborasi");
        }
        }
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