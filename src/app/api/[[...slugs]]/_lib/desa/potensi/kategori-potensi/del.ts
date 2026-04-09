import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function kategoriPotensiDelete(context: Context) {
    try {
        const id = context.params?.id as string;

        if (!id) {
            return Response.json({
                success: false,
                message: "ID tidak boleh kosong",
            }, { status: 400 });
        }

        // ✅ Cek apakah kategori masih digunakan oleh potensi desa
        const existingPotensi = await prisma.potensiDesa.findFirst({
            where: {
                kategoriId: id,
                isActive: true,
            },
        });

        if (existingPotensi) {
            return Response.json({
                success: false,
                message: "Kategori masih digunakan oleh potensi desa. Tidak dapat dihapus.",
            }, { status: 400 });
        }

        // Soft delete
        await prisma.kategoriPotensi.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });

        return {
            success: true,
            message: "Kategori potensi berhasil dihapus",
        };
    } catch (error) {
        console.error("Delete kategori error:", error);
        return Response.json({
            success: false,
            message: "Gagal menghapus kategori: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, { status: 500 });
    }
}