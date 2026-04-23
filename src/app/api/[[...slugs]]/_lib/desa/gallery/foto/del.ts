import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

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
            await minio.removeObject(MINIO_BUCKET, `${foto.imageGalleryFoto.path}/${foto.imageGalleryFoto.name}`);
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
