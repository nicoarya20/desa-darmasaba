import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const potensiDesaDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const potensiDesa = await prisma.potensiDesa.findUnique({
        where: { id },
        include: {
            image: true,
            kategori: true
        },
    });

    if (!potensiDesa) {
        return {
            status: 404,
            body: "Potensi Desa tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (potensiDesa.image) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${potensiDesa.image.path}/${potensiDesa.image.name}`);
            await prisma.fileStorage.delete({
                where: { id: potensiDesa.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus file image:", err);
        }
    }

    // Hapus potensi desa dari DB
    await prisma.potensiDesa.delete({
        where: { id },
    });

    return {
        success: true,
        message: "Potensi Desa dan file terkait berhasil dihapus",
    };
};

export default potensiDesaDelete;