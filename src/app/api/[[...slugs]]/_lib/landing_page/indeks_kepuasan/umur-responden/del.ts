import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function umurRespondenDelete(context: Context) {
    const id = context.params.id as string;

    await prisma.umurResponden.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Success delete umur responden",
    };
}