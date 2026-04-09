import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

type FormUpdate = Prisma.PosyanduGetPayload<{
    select: {
        id: true;
        name: true;
        nomor: true;
        deskripsi: true;
        imageId: true;
        jadwalPelayanan: true;
    }
}>

export default async function posyanduUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const {
            name,
            nomor,
            deskripsi,
            imageId,
            jadwalPelayanan,
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

        const existing = await prisma.posyandu.findUnique({
            where: { id },
            include: {
                image: true,
            }
        })

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Posyandu tidak ditemukan",
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
                } catch (err) {
                    console.error("Gagal hapus gambar lama:", err);
                }
            }
        }

        const updated = await prisma.posyandu.update({
            where: { id },
            data: {
                name,
                nomor,
                deskripsi,
                imageId,
                jadwalPelayanan,
            }
        })

        return new Response(JSON.stringify({
            success: true,
            message: "Posyandu berhasil diupdate",
            data: updated,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error("Error updating posyandu:", error); 
        return new Response(
            JSON.stringify({
                success: false,
                message: "Terjadi kesalahan saat mengupdate posyandu",
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}