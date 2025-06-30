import prisma from "@/lib/prisma";

export default async function menuTipsKeamananFindMany() {
    try {
        const data = await prisma.menuTipsKeamanan.findMany({
            where: { isActive: true },
            include: {
                image: true,
            },
        });

        return {
            success: true,
            message: "Success fetch menu tips keamanan",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch menu tips keamanan",
        };
    }
}