import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kategoriBeritaDelete(context: Context) {
    try {
        const id = context.params?.id as string;

        if (!id) {
            return Response.json({
                success: false,
                message: "ID tidak boleh kosong",
            }, { status: 400 });
        }

        // ✅ Cek apakah kategori masih digunakan oleh berita
        const beritaCount = await prisma.berita.count({
            where: {
                kategoriBeritaId: id,
                isActive: true,
                deletedAt: null,
            },
        });

        if (beritaCount > 0) {
            return Response.json({
                success: false,
                message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${beritaCount} berita`,
            }, { status: 400 });
        }

        // ✅ Soft delete (bukan hard delete)
        await prisma.kategoriBerita.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });

        return {
            success: true,
            message: "Kategori berita berhasil dihapus",
        };
    } catch (error) {
        console.error("Delete kategori error:", error);
        return Response.json({
            success: false,
            message: "Gagal menghapus kategori: " + (error instanceof Error ? error.message : 'Unknown error'),
        }, { status: 500 });
    }
}