import prisma from "@/lib/prisma";
import fs from "fs/promises";
import type { Context } from "elysia";
import path from "path";

const programKesehatanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const programKesehatan = await prisma.programKesehatan.findUnique({
        where: { id },
        include: { image: true },
    });

    if (!programKesehatan) {
        return {
            status: 404,
            body: "Program kesehatan tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (programKesehatan.image) {
        try {
            const filePath = path.join(programKesehatan.image.path, programKesehatan.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: programKesehatan.image.id },
            });
        } catch (error) {
            console.error("Gagal hapus file image:", error);
        }
    }

    // Hapus berita dari DB
    await prisma.programKesehatan.delete({
        where: { id },
    });

    return {
        success: true,
        message: "Program kesehatan dan file terkait berhasil dihapus",
    };
};

export default programKesehatanDelete;