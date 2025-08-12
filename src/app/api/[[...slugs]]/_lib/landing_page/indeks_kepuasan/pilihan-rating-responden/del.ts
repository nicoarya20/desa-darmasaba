import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pilihanRatingRespondenDelete(context: Context) {
    const id = context.params.id as string;

    await prisma.pilihanRatingResponden.delete({
        where: { id },
    });

    return {
        status: 200,
        success: true,
        message: "Success delete pilihan rating responden",
    };
}