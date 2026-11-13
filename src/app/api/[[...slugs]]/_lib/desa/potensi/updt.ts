import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

        if (existing.imageId && existing.imageId !== imageId) {
            const oldImage = existing.image;
            if (oldImage) {
                await removeStoredFile(oldImage, "PotensiDesa");
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Potensi Desa berhasil diupdate",
                data: updated,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        // Ganti nama ke potensi lain yang sudah ada → 409 "Nama sudah dipakai"
        const duplicate = toDuplicateResponse(error);
        if (duplicate) {
            return new Response(JSON.stringify(duplicate), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }
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
    
