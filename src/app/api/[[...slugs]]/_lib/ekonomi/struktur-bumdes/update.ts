import prisma from "@/lib/prisma";
import { Context } from "elysia";
import path from "path";
import fs from "fs/promises";
import { Prisma } from "@prisma/client";

type FormUpdate = Prisma.StrukturBumDesGetPayload<{
    select: {
        id: true;
        name: true;
        imageId: true;
    };
}>;

export default async function strukturBumDesUpdate(context: Context) {
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

    const existing = await prisma.strukturBumDes.findUnique({
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

    const updated = await prisma.strukturBumDes.update({
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
            message: "Struktur BumDes Berhasil Dibuat",
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
    console.error("Error updating struktur BumDes:", error);
    return new Response(
        JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate struktur BumDes",
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
    