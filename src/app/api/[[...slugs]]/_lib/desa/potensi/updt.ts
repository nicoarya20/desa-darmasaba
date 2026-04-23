import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

type FormUpdate = Prisma.PotensiDesaGetPayload<{
    select: {
        id: true;
        name: true;
        deskripsi: true;
        kategoriId: true;
        imageId: true;
        content: true;
    };
}>;

export default async function potensiDesaUpdate(context: Context) {
    try {
        const id = context.params?.id as string;
    const body = (await context.body) as Omit<FormUpdate, "id">;

    const {
        name,
        deskripsi,
        kategoriId,
        imageId,
        content,
        } = body;

        if (!id) {
            return new Response(
                JSON.stringify({ success: false, message: "ID tidak ditemukan" }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const existing = await prisma.potensiDesa.findUnique({
            where: { id },
            include: {
                image: true,
                kategori: true
            }
        });

        if (!existing) {
            return new Response(
                JSON.stringify({ success: false, message: "Potensi Desa tidak ditemukan"}),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
                try {
                    await minio.removeObject(MINIO_BUCKET, `${oldImage.path}/${oldImage.name}`);
                    await prisma.fileStorage.delete({
                        where: { id: oldImage.id },
                    });
                } catch (error) {
                    console.error("Gagal hapus gambar lama:", error);
                }
            }
        }

        const updated = await prisma.potensiDesa.update({
            where: { id },
            data: {
                name,
                deskripsi,
                kategoriId,
                imageId,
                content,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Potensi Desa berhasil diupdate",
                data: updated,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error("Error updating potensi desa:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Terjadi kesalahan saat mengupdate potensi desa",
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
}
    
