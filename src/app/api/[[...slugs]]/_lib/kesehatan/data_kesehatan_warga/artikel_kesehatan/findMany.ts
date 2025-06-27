import prisma from "@/lib/prisma";

export default async function artikelKesehatanFindMany() {
    try {
        const data = await prisma.artikelKesehatan.findMany({
            where: {
                isActive: true,
            },
            include: {
                introduction: true,
                symptom: true,
                prevention: true,
                firstaid: true,
                mythvsfact: true,
                doctorsign: true,
            }
        })
        return {
            success: true,
            message: "Success fetch artikel kesehatan",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch artikel kesehatan",
        }
    }
}