import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const programKesehatanDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const programKesehatan = await prisma.programKesehatan.findUnique({
        where: { id },
        include: { image: true },
    });

    if (!programKesehatan) {
        return {
            status: 404,
            body: "Program kesehatan tidak ditemukan",
        };
    }

    // Hapus berita dari DB
    await prisma.programKesehatan.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (programKesehatan.image) {
        await removeStoredFile(programKesehatan.image, "ProgramKesehatan");
    }

    return {
        success: true,
        message: "Program kesehatan dan file terkait berhasil dihapus",
    };
};

export default programKesehatanDelete;