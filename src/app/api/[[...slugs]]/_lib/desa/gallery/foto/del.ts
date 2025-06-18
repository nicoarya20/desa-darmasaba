import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

const galleryFotoDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const foto = await prisma.galleryFoto.findUnique({
        where: { id },
        include: {
            imageGalleryFoto: true,
        },
    });

    if (!foto) {
        return {
            status: 404,
            body: "Foto tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (foto.imageGalleryFoto) {
        try {
            const filePath = path.join(foto.imageGalleryFoto.path, foto.imageGalleryFoto.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: foto.imageGalleryFoto.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    await prisma.galleryFoto.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Foto berhasil dihapus",
    };
}

export default galleryFotoDelete
