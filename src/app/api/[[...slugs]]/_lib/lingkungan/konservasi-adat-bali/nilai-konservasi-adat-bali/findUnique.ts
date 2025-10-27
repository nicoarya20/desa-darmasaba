import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function nilaiKonservasiAdatBaliFindUnique(context: Context) {
    try {
        const id = context?.params?.slugs?.[0];

        // If no ID provided, get the first profile
        if (!id) {
            const data = await prisma.nilaiKonservasiAdat.findFirst();
            return {
                success: true,
                data,
            };
        }

        const data = await prisma.nilaiKonservasiAdat.findUniqueOrThrow({
            where: { id },
        });

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error fetching nilai konservasi adat bali:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}