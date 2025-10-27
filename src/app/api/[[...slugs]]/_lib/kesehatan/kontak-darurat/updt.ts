import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

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

        const updated = await prisma.kontakDarurat.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
                whatsapp,
            }
        })

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
    