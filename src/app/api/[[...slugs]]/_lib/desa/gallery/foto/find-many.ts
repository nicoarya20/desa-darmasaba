import prisma from "@/lib/prisma";

async function galleryFotoFindMany() {
    try {
        const data = await prisma.galleryFoto.findMany({
            where: { isActive: true },
            include: {
                imageGalleryFoto: true,
            },
        });

        return {
            success: true,
            message: "Success fetch gallery foto",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch gallery foto",
        };
    }
}
export default galleryFotoFindMany