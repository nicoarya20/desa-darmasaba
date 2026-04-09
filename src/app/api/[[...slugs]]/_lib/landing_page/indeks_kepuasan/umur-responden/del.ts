import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function umurRespondenDelete(context: Context) {
    const id = context.params.id as string;

    await prisma.umurResponden.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Sukses Menghapus umur responden",
    };
}