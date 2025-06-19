import prisma from "@/lib/prisma";

export default async function programKesehatanFindMany() {
    try {
        const data = await prisma.programKesehatan.findMany({
            where: {
                isActive: true,
            },
            include: {
                image: true,
            }
        })
        return {
            success: true,
            message: "Success fetch program kesehatan",
            data,
        }
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch program kesehatan",
        }
    }
}