import prisma from "@/lib/prisma";
import path from "path";
import { Context } from "vm";
import fs from "fs/promises";

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
        },
    });

    if (!potensiDesa) {
        return {
            status: 404,
            body: "Potensi Desa tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (potensiDesa.image) {
        try {
            const filePath = path.join(potensiDesa.image.path, potensiDesa.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: potensiDesa.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus file image:", err);
        }
    }

    // Hapus potensi desa dari DB
    await prisma.potensiDesa.delete({
        where: { id },
    });

    return {
        success: true,
        message: "Potensi Desa dan file terkait berhasil dihapus",
    };
};

export default potensiDesaDelete;