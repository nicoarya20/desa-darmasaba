import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

    // Hapus potensi desa dari DB
    await prisma.potensiDesa.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (potensiDesa.image) {
        await removeStoredFile(potensiDesa.image, "PotensiDesa");
    }

    return {
        success: true,
        message: "Potensi Desa dan file terkait berhasil dihapus",
    };
};

export default potensiDesaDelete;