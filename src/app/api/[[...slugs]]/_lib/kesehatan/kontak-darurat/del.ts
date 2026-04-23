import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const kontakDaruratDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const kontakDarurat = await prisma.kontakDarurat.findUnique({
        where: { id },
        include: { image: true },
    });

    if (!kontakDarurat) {
        return {
            status: 404,
            body: "Kontak darurat tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (kontakDarurat.image) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${kontakDarurat.image.path}/${kontakDarurat.image.name}`);
            await prisma.fileStorage.delete({
                where: { id: kontakDarurat.image.id },
              });
        } catch (error) {
            console.error("Error deleting image file:", error);
        }
    }

    await prisma.kontakDarurat.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Kontak darurat dan file terkait berhasil dihapus",
    };
};
export default kontakDaruratDelete;
