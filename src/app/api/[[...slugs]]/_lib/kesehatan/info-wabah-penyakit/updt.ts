import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

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

        const updated = await prisma.infoWabahPenyakit.update({
            where: { id },
            data: {
                name,
                deskripsiSingkat,
                deskripsiLengkap,
                imageId,
            }
        })

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