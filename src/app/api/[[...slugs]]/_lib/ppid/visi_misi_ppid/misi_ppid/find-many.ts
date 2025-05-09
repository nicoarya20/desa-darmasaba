import prisma from "@/lib/prisma";

export async function misiPPIDFindMany() {
    const res = await prisma.misiPPID.findMany();
    return {
        data: res,
    };
}