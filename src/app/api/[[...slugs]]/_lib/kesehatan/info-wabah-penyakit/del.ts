import prisma from "@/lib/prisma";
import fs from "fs/promises";
import { Context } from "elysia";
import path from "path";

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

    // Hapus file gambar dari filesystem jika ada
    if (infoWabahPenyakit.image) {
        try {
            const filePath = path.join(infoWabahPenyakit.image.path, infoWabahPenyakit.image.name);
            await fs.unlink(filePath);
        } catch (err) {
            console.error("Gagal hapus gambar:", err);
        }
    }

    await prisma.infoWabahPenyakit.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Info wabah penyakit berhasil dihapus",
    };
};
export default infoWabahPenyakitDelete;