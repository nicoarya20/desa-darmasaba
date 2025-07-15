import prisma from "@/lib/prisma";

export default async function infoTeknoFindMany() {
    try {
        const data = await prisma.infoTekno.findMany({
            include: {
                image: true,
            },
        });

        return {
            success: true,
            message: "Success fetch info teknologi",
            data,
        };
    } catch (error) {
        console.error("Find many error:", error);
        return {
            success: false,
            message: "Failed fetch info teknologi",
        };
    }
}