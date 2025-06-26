import prisma from "@/lib/prisma";

export default async function penangananDaruratFindMany() {
    try {
        const data = await prisma.penangananDarurat.findMany({
            where: {
                isActive: true,
            },
            include: {
                image: true,
            }
        })
        return {
            success: true,
            message: "Success fetch penanganan darurat",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch penanganan darurat",
        }
    }
}