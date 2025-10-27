import prisma from "@/lib/prisma";

export default async function kategoriBukuFindUnique(request: Request) {
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

        const data = await prisma.kategoriPotensi.findUnique({
            where: { id },
        });

        if (!data) {
            return {
                success: false,
                message: "Data not found",
            }
        }

        return {
            success: true,
            message: "Success get kategori potensi",
            data,
        }
    } catch (error) {
        console.error("Find by ID error:", error);
        return {
            success: false,
            message: "Gagal mengambil data: " + (error instanceof Error ? error.message : 'Unknown error'),
        }
    }
}