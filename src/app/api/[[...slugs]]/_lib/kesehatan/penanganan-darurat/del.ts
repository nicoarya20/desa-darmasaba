import prisma from "@/lib/prisma";
import fs from "fs/promises";
import { Context } from "elysia";
import path from "path";

const penangananDaruratDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const penangananDarurat = await prisma.penangananDarurat.findUnique({
        where: { id },
        include: { image: true },
    });
    if (!penangananDarurat) {
        return {
            status: 404,
            body: "Penanganan darurat tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (penangananDarurat.image) {
        try {
            const filePath = path.join(penangananDarurat.image.path, penangananDarurat.image.name);
            await fs.unlink(filePath);
        } catch (error) {
            console.error("Error deleting image file:", error);
        }
    }

    // Hapus data dari database
    await prisma.penangananDarurat.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Penanganan darurat berhasil dihapus",
    };
};
export default penangananDaruratDelete;