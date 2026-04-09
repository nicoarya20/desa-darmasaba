import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import type { Context } from "elysia";

type FormUpdate = Prisma.PenghargaanGetPayload<{
    select: {
        id: true;
        juara: true;
        name: true;
        deskripsi: true;
        imageId: true;
    }
}>
export default async function penghargaanUpdate(context: Context) {
try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const {
        juara,
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

    const existing = await prisma.penghargaan.findUnique({
        where: {id},
        include: {
            image: true,
        }
    })

    if (!existing) {
        return new Response(JSON.stringify({
            success: false,
            message: "Penghargaan tidak ditemukan",
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

    const updated = await prisma.penghargaan.update({
        where: { id },
        data: {
            juara,
            name,
            deskripsi,
            imageId,
        }
    })

    return new Response(JSON.stringify({
        success: true,
        message: "Penghargaan berhasil diupdate",
        data: updated,
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
} catch (error) {
    console.error("Error updating penghargaan:", error); 
    return new Response(JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate penghargaan",
    }), {
        status: 500,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
}