import prisma from "@/lib/prisma";

export default async function doctorSignFindMany() {
    const data = await prisma.doctorSign.findMany();
    return {
        success: true,
        message: "Success get doctor sign",
        data,
    };
}