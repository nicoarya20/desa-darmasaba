import prisma from "@/lib/prisma";
import { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

const menuTipsKeamananDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const tipsKeamanan = await prisma.menuTipsKeamanan.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!tipsKeamanan) {
        return {
            status: 404,
            body: "Tips keamanan tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (tipsKeamanan.image) {
        try {
            const filePath = path.join(tipsKeamanan.image.path, tipsKeamanan.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: tipsKeamanan.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    // Hapus tips keamanan dari database
    const deleted = await prisma.menuTipsKeamanan.delete({
        where: { id },
    });

    return {
        success: true,
        message: "Success delete menu tips keamanan",
        data: deleted,
    };
};
export default menuTipsKeamananDelete;