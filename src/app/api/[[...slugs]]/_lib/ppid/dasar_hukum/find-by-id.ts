import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { PPID_FILE_SELECT } from "../ppid-file";

export default async function dasarHukumPPIDFindById(context: Context) {
    try {
        const id = context?.params?.slugs?.[0];

        // If no ID provided, get the first profile
        if (!id) {
            const data = await prisma.dasarHukumPPID.findFirst({
                include: { file: { select: PPID_FILE_SELECT } },
            });
            return {
                success: true,
                data,
            };
        }

        const data = await prisma.dasarHukumPPID.findUniqueOrThrow({
            where: { id },
            include: { file: { select: PPID_FILE_SELECT } },
        });

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error fetching profilePPID:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}