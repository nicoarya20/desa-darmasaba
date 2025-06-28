import prisma from "@/lib/prisma";

export default async function polsekTerdekatFindMany() {
    try {
        const data = await prisma.polsekTerdekat.findMany({
            where: { isActive: true },
            include: {
                layananPolsek: true,
            },
        });

        return {
            success: true,
            message: "Success fetch polsek terdekat",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch polsek terdekat",
        };
    }
}