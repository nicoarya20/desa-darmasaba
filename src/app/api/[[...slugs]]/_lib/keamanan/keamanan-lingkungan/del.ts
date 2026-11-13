import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const keamananLingkunganDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const keamananLingkungan = await prisma.keamananLingkungan.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!keamananLingkungan) {
        return {
            status: 404,
            body: "Keamanan lingkungan tidak ditemukan",
        };
    }

    const deleted = await prisma.keamananLingkungan.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (keamananLingkungan.image) {
        await removeStoredFile(keamananLingkungan.image, "KeamananLingkungan");
    }

    return {
        status: 200,
        body: deleted,
        success: true,
        message: "Keamanan lingkungan berhasil dihapus",
    };
};
export default keamananLingkunganDelete;