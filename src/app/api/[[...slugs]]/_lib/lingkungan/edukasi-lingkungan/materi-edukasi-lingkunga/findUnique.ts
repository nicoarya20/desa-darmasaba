import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function materiEdukasiLingkunganFindUnique(context: Context) {
    try {
        const id = context?.params?.slugs?.[0];

        // If no ID provided, get the first profile
        if (!id) {
            const data = await prisma.materiEdukasiLingkungan.findFirst();
            return {
                success: true,
                data,
            };
        }

        const data = await prisma.materiEdukasiLingkungan.findUniqueOrThrow({
            where: { id },
        });

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error fetching materi edukasi lingkungan:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}