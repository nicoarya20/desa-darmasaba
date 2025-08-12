import prisma from "@/lib/prisma";

export default async function respondenFindUnique(request: Request) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id) {
        return {
            success: false,
            message: "ID is required",
        }
    }

    try {
        if (typeof id !== 'string') {
            return {
                success: false,
                message: "ID is required",
            }
        }

        const data = await prisma.responden.findUnique({
            where: { id },
            include: {
                jenisKelamin: true,
                rating: true,
                kelompokUmur: true,
            },
        });

        if (!data) {
            return {
                success: false,
                message: "Data not found",
            }
        }

        return {
            success: true,
            message: "Success fetch responden by ID",
            data,
        }
    } catch (e) {
        console.error("Find by ID error:", e);
        return {
            success: false,
            message: "Gagal mengambil responden: " + (e instanceof Error ? e.message : 'Unknown error'),
        }
    }
}