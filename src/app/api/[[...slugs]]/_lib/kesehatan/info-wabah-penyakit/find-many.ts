import prisma from "@/lib/prisma";

export default async function infoWabahPenyakitFindMany() {
    try {
        const data = await prisma.infoWabahPenyakit.findMany({
            where: {
                isActive: true,
            },
            include: {
                image: true,
            }
        })
        return {
            success: true,
            message: "Success fetch info wabah penyakit",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch info wabah penyakit",
        }
    }
}