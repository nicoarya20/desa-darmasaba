import prisma from "@/lib/prisma";

async function potensiDesaFindMany() {
    try {
        const data = await prisma.potensiDesa.findMany({
            where: { isActive: true },
            include: {
                image: true,
            },
        });

        return {
            success: true,
            message: "Success fetch potensi desa",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch potensi desa",
        };
    }
}

export default potensiDesaFindMany