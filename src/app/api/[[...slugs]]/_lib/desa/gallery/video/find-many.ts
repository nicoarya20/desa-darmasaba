import prisma from "@/lib/prisma";

async function galleryVideoFindMany() {
    try {
        const data = await prisma.galleryVideo.findMany({
            where: { isActive: true },
        });

        return {
            success: true,
            message: "Success fetch gallery video",
            data,
        };
    } catch (e) {
        console.error("Find many error:", e);
        return {
            success: false,
            message: "Failed fetch gallery video",
        };
    }
}
export default galleryVideoFindMany;