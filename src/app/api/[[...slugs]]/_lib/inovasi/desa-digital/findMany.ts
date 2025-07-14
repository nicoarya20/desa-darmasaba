import prisma from "@/lib/prisma";

export default async function desaDigitalFindMany() {
    try {
        const data = await prisma.desaDigital.findMany({
            include: {
                image: true,
            },
        });

        return {
            success: true,
            message: "Success fetch desa digital",
            data,
        };
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch desa digital",
        };
    }
}