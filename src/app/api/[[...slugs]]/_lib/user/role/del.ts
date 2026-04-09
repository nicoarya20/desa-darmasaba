import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function roleDelete(context: Context) {
    const id = context.params.id as string;

    await prisma.role.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Sukses Menghapus role",
    };
}