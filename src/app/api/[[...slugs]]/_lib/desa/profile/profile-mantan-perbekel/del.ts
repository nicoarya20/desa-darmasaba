import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const profileMantanPerbekelDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const foto = await prisma.perbekelDariMasaKeMasa.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!foto) {
        return {
            status: 404,
            body: "Foto tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (foto.image) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${foto.image.path}/${foto.image.name}`);
            await prisma.fileStorage.delete({
                where: { id: foto.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    await prisma.perbekelDariMasaKeMasa.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Foto berhasil dihapus",
    };
}

export default profileMantanPerbekelDelete
