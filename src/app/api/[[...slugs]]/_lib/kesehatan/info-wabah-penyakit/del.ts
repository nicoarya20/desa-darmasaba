import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

    await prisma.infoWabahPenyakit.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (infoWabahPenyakit.image) {
        await removeStoredFile(infoWabahPenyakit.image, "InfoWabahPenyakit");
    }

    return {
        status: 200,
        success: true,
    message: "Penanganan darurat dan file terkait berhasil dihapus",
    };
};
export default infoWabahPenyakitDelete;