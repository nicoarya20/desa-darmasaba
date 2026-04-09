import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function filosofiTriHitaKaranaFindUnique(context: Context) {
    try {
        const id = context?.params?.slugs?.[0];

        // If no ID provided, get the first profile
        if (!id) {
            const data = await prisma.filosofiTriHita.findFirst();
            return {
                success: true,
                data,
            };
        }

        const data = await prisma.filosofiTriHita.findUniqueOrThrow({
            where: { id },
        });

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error fetching filosofi tri hita karana:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}