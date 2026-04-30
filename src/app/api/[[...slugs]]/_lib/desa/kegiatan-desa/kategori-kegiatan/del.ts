import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kategoriKegiatanDelete(context: Context) {
    try {
        const id = context.params?.id as string;

        if (!id) {
            return Response.json({
                success: false,
                message: "ID tidak boleh kosong",
            }, { status: 400 });
        }

        // ✅ Cek apakah kategori masih digunakan oleh kegiatan
        const kegiatanCount = await prisma.kegiatanDesa.count({
            where: {
                kategoriKegiatanId: id,
                isActive: true,
            },
        });

        if (kegiatanCount > 0) {
            return Response.json({
                success: false,
                message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${kegiatanCount} kegiatan`,
            }, { status: 400 });
        }

        // ✅ Soft delete (bukan hard delete)
        await prisma.kategoriKegiatan.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });

        return {
            success: true,
            message: "Kategori kegiatan berhasil dihapus",
        };
    } catch (error) {
        console.error("Delete kategori error:", error);
        return Response.json({
            success: false,
            message: "Gagal menghapus kategori: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, { status: 500 });
    }
}