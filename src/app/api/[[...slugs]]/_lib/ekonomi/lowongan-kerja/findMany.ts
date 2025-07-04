import prisma from "@/lib/prisma";

export default async function lowonganKerjaFindMany() {
    try {
        const data = await prisma.lowonganPekerjaan.findMany({
            where: { isActive: true },
        });

        return {
            success: true,
            message: "Success fetch lowongan kerja",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch lowongan kerja",
        };
    }
}