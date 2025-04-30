import prisma from "@/lib/prisma";

export default async function pengumumanFindMany() {
    const res = await prisma.pengumuman.findMany();
    return {
        data: res,
    };
}