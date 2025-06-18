import prisma from "@/lib/prisma";

export default async function posyanduFindMany() {
try {
    const data = await prisma.posyandu.findMany({
        where: {
            isActive: true,
        },
        include: {
            image: true,
        }
    })
    return {
        success: true,
        message: "Success fetch posyandu",
        data,
    }
} catch (error) {
    console.error("Find many error:", error);
    return {
        success: false,
        message: "Failed fetch posyandu",
    }
}

}