import prisma from "@/lib/prisma";
import { Context } from "elysia";

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
    });

    if (!kontakDaruratKeamanan) {
        return {
            status: 404,
            body: "Kontak darurat keamanan tidak ditemukan",
        };
    }

    await prisma.kontakDaruratKeamanan.delete({
        where: { id },
    });

    return {
        status: 200,
        body: "Kontak darurat keamanan berhasil dihapus",
    };
}