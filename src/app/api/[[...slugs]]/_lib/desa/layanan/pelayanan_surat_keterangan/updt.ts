import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import type { Context } from "elysia";

type FormUpdate = Prisma.PelayananSuratKeteranganGetPayload<{
    select: {
        name: true;
        deskripsi: true;
        imageId: true;
        image2Id: true;
    };
}>;
export default async function updatePelayananSuratKeterangan(context: Context) {
    try {
        const id = context.params?.id;
        const body = (await context.body) as Omit<FormUpdate, "id">;

        const { name, deskripsi, imageId, image2Id } = body;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                message: "ID tidak diberikan",
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }
        const existing = await prisma.pelayananSuratKeterangan.findUnique({
            where: { id },
            include: {
                image: true,
            }
        });

        if (!existing) {
            return new Response(JSON.stringify({
                success: false,
                message: "Pelayanan surat keterangan tidak ditemukan",
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
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

        if (existing.image2Id && existing.image2Id !== image2Id) {
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

        const updated = await prisma.pelayananSuratKeterangan.update({
            where: { id },
            data: {
                name,
                deskripsi,
                imageId,
                image2Id,
            },
        })

        return new Response(JSON.stringify({
            success: true,
            message: "Success update pelayanan surat keterangan",
            data: updated,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error updating pelayanan surat keterangan:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Terjadi kesalahan saat mengupdate pelayanan surat keterangan",
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}