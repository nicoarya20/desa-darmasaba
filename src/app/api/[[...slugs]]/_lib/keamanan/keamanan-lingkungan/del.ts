import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

const keamananLingkunganDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const keamananLingkungan = await prisma.keamananLingkungan.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!keamananLingkungan) {
        return {
            status: 404,
            body: "Keamanan lingkungan tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (keamananLingkungan.image) {
        try {
            const filePath = path.join(keamananLingkungan.image.path, keamananLingkungan.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: keamananLingkungan.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    const deleted = await prisma.keamananLingkungan.delete({
        where: { id },
    });

    return {
        status: 200,
        body: deleted,
        success: true,
        message: "Keamanan lingkungan berhasil dihapus",
    };
};
export default keamananLingkunganDelete;