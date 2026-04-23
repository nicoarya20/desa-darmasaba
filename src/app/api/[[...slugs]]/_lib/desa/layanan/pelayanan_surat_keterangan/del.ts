import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const pelayananSuratKeteranganDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const pelayananSuratKeterangan = await prisma.pelayananSuratKeterangan.findUnique({
        where: { id },
        include: {
            image: true,
            image2: true,
        },
    });

    if (!pelayananSuratKeterangan) {
        return {
            status: 404,
            body: "Pelayanan surat keterangan tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (pelayananSuratKeterangan.image) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${pelayananSuratKeterangan.image.path}/${pelayananSuratKeterangan.image.name}`);
            await prisma.fileStorage.delete({
                where: { id: pelayananSuratKeterangan.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    if (pelayananSuratKeterangan.image2) {
        try {
            await minio.removeObject(MINIO_BUCKET, `${pelayananSuratKeterangan.image2.path}/${pelayananSuratKeterangan.image2.name}`);
            await prisma.fileStorage.delete({
                where: { id: pelayananSuratKeterangan.image2.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    const deleted = await prisma.pelayananSuratKeterangan.delete({
        where: { id },
    });

    return {
        status: 200,
        body: deleted,
    };
};
export default pelayananSuratKeteranganDelete;