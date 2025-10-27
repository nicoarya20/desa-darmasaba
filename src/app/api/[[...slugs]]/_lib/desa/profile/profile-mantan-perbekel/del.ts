import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

const profileMantanPerbekelDelete = async (context: Context) => {
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const foto = await prisma.perbekelDariMasaKeMasa.findUnique({
        where: { id },
        include: {
            image: true,
        },
    });

    if (!foto) {
        return {
            status: 404,
            body: "Foto tidak ditemukan",
        };
    }

    // Hapus file gambar dari filesystem jika ada
    if (foto.image) {
        try {
            const filePath = path.join(foto.image.path, foto.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
                where: { id: foto.image.id },
            });
        } catch (err) {
            console.error("Gagal hapus gambar lama:", err);
        }
    }

    await prisma.perbekelDariMasaKeMasa.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Foto berhasil dihapus",
    };
}

export default profileMantanPerbekelDelete
