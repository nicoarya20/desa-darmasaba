import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

    await prisma.kontakDarurat.delete({
        where: { id },
    });

    // Hapus file gambar dari filesystem jika ada
    if (kontakDarurat.image) {
        await removeStoredFile(kontakDarurat.image, "KontakDarurat");
    }

    return {
        status: 200,
        success: true,
        message: "Kontak darurat dan file terkait berhasil dihapus",
    };
};
export default kontakDaruratDelete;
