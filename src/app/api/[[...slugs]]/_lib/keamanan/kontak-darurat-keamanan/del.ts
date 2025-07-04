import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

export default async function kontakDaruratKeamananDelete(context: Context){
    const id = context.params?.id as string;

    if (!id) {
        return {
            status: 400,
            body: "ID tidak diberikan",
        };
    }

    await prisma.kontakItem.deleteMany({
        where: {
          kategoriId: id,
        },
      });

    const kontakDaruratKeamanan = await prisma.kontakDaruratKeamanan.findUnique({
        where: { id },
        include: {
            kontakItems: true,
            image: true,
        }
    });

    if (!kontakDaruratKeamanan) {
        return {
            status: 404,
            body: "Kontak darurat keamanan tidak ditemukan",
        };
    }

    if (kontakDaruratKeamanan.image) {
        try {
            const filePath = path.join(kontakDaruratKeamanan.image.path, kontakDaruratKeamanan.image.name);
            await fs.unlink(filePath);
            await prisma.fileStorage.delete({
              where: { id: kontakDaruratKeamanan.image.id },
            });
          } catch (err) {
            console.error("Gagal hapus file image:", err);
          }
    }

    await prisma.kontakDaruratKeamanan.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Kontak darurat keamanan berhasil dihapus",
    };
}