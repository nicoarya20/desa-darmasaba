import prisma from "@/lib/prisma";

export default async function pencegahanKriminalitasFindMany() {
    try {
        const data = await prisma.pencegahanKriminalitas.findMany({
            where: {
                isActive: true,
            },
            include: {
                programKeamanan: true,
                tipsKeamanan: true,
                videoKeamanan: true,
            }
        })
        return {
            success: true,
            message: "Success fetch pencegahan kriminalitas",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch pencegahan kriminalitas",
        }
    }
}