import prisma from "@/lib/prisma";

export default async function kontakDaruratFindMany() {
    try {
        const data = await prisma.kontakDarurat.findMany({
            where: {
                isActive: true,
            },
            include: {
                image: true,
            }
        })
        return {
            success: true,
            message: "Success fetch kontak darurat",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch kontak darurat",
        }
    }
}