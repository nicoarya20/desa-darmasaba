import prisma from "@/lib/prisma";

export default async function pasarDesaFindMany() {
    try {
        const data = await prisma.pasarDesa.findMany({
            where: { isActive: true },
            include: {
                image: true,
                kategori: true,
            },
        });

        return {
            success: true,
            message: "Success fetch pasar desa",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch pasar desa",
        };
    }
}