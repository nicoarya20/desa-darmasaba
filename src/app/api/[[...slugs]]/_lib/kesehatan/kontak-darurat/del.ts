import prisma from "@/lib/prisma";
import fs from "fs/promises";
import { Context } from "elysia";
import path from "path";

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
            const filePath = path.join(kontakDarurat.image.path, kontakDarurat.image.name);
            await fs.unlink(filePath);
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
