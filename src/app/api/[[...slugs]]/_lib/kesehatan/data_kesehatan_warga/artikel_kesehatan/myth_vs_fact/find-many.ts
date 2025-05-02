import prisma from "@/lib/prisma";

export default async function mythVsFactFindMany() {
    const mythVsFacts = await prisma.mythVsFact.findMany();
    return {
        success: true,
        message: "Success get myth vs fact",
        data: mythVsFacts,
    };
}