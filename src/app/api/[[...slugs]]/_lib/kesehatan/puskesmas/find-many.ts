import prisma from "@/lib/prisma";

export default async function puskesmasFindMany() {
    try {
        const data = await prisma.puskesmas.findMany({
            where: {
                isActive: true,
            },
            include: {
                image: true,
                jam: true,
                kontak: true,
            }
        })
        return {
            success: true,
            message: "Success fetch puskesmas",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch puskesmas",
        }
    }
}