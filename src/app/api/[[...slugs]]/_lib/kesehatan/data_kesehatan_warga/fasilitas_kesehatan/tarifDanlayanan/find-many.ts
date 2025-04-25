import prisma from "@/lib/prisma";

export default async function tarifdanlayananFindMany() {
    const res = await prisma.tarifDanLayanan.findMany();
    return {
        data: res
    }
}