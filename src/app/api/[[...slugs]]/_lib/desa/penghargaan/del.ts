import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const penghargaanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const penghargaan = await prisma.penghargaan.findUnique({
        where: { id },
        include: {
            image: true,
        }
    });

    if (!penghargaan) {
        return {
            status: 404,
            body: "Penghargaan tidak ditemukan",
        };
    }

    if (penghargaan.image) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${penghargaan.image.path}/${penghargaan.image.name}`);
            await prisma.fileStorage.delete({
                where: { id: penghargaan.image.id },
            });
        } catch (error) {
            console.error("Gagal hapus file image:", error);
        }
    }

    await prisma.penghargaan.delete({
        where: { id },
    });

    return {
        success: true,
        message: "Penghargaan berhasil dihapus",
        status: 200,
    };
}

export default penghargaanDelete
