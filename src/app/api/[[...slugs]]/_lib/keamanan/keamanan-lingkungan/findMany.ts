import prisma from "@/lib/prisma";

export default async function keamananLingkunganFindMany() {
    try {
        const data = await prisma.keamananLingkungan.findMany({
            where: { isActive: true },
            include: {
                image: true,
            },
        });

        return {
            success: true,
            message: "Success fetch keamanan lingkungan",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch keamanan lingkungan",
        };
    }
}