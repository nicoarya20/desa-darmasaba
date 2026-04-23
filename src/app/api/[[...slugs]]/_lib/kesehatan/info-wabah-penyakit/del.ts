import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const infoWabahPenyakitDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const infoWabahPenyakit = await prisma.infoWabahPenyakit.findUnique({
        where: { id },
        include: { image: true },
    });

    if (!infoWabahPenyakit) {
        return {
            status: 404,
            body: "Info wabah penyakit tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (infoWabahPenyakit.image) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${infoWabahPenyakit.image.path}/${infoWabahPenyakit.image.name}`);
            await prisma.fileStorage.delete({
                where: { id: infoWabahPenyakit.image.id },
              });
        } catch (err) {
            console.error("Gagal hapus gambar:", err);
        }
    }

    await prisma.infoWabahPenyakit.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
    message: "Penanganan darurat dan file terkait berhasil dihapus",
    };
};
export default infoWabahPenyakitDelete;