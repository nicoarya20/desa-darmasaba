import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

    await prisma.galleryFoto.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (foto.imageGalleryFoto) {
        await removeStoredFile(foto.imageGalleryFoto, "GalleryFoto");
    }

    return {
        status: 200,
        body: "Foto berhasil dihapus",
    };
}

export default galleryFotoDelete
