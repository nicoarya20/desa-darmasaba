import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";
import type { Prisma } from "@prisma/client";

type FormUpdate = Prisma.StrukturPPIDGetPayload<{
    select: {
        id: true;
        name: true;
        imageId: true;
    };
}>;

export default async function strukturPPIDUpdate(context: Context) {
try {
    const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const { name, imageId } = body;

    if (!id) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "ID tidak boleh kosong",
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
    }

    const existing = await prisma.strukturPPID.findUnique({
        where: {
            id
        },
        include: {
            image: true,
        }
    })

    if (!existing) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Data tidak ditemukan",
            }),
            {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
    }

    if (existing.imageId !== imageId) {
       const oldImage = existing.image;
       if (oldImage) {
        try {
            const filePath = path.join(oldImage.path, oldImage.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: oldImage.id },
            })
        } catch (error) {
            console.error("Gagal hapus gambar lama:", error);
        }
       } 
    }

    const updated = await prisma.strukturPPID.update({
        where: {
            id
        },
        data: {
            name,
            imageId,
        }
    })

    return new Response(
        JSON.stringify({
            success: true,
            message: "Struktur PPID Berhasil Dibuat",
            data: updated,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

} catch (error) {
    console.error("Error updating struktur PPID:", error);
    return new Response(
        JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate struktur PPID",
        }),
        {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        }
    )
}
}
    