import prisma from "@/lib/prisma";
import { Context } from "elysia";

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
    });

    if (!kontakItem) {
        return {
            status: 404,
            body: "Kontak darurat keamanan tidak ditemukan",
        };
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