import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

export default async function kontakItemDelete(context: Context){
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    const kontakItem = await prisma.kontakItem.findUnique({
        where: { id },
        include: {
            image: true
        }
    });

    if (!kontakItem) {
        return {
            status: 404,
            body: "Kontak darurat keamanan tidak ditemukan",
        };
    }

    if (kontakItem.image) {
        try {
            const filePath = path.join(kontakItem.image.path, kontakItem.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
              where: { id: kontakItem.image.id },
            });
          } catch (err) {
            console.error("Gagal hapus file image:", err);
          }
    }

    await prisma.kontakItem.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Kontak item berhasil dihapus",
    };
}