import prisma from "@/lib/prisma";

export default async function informasiUmumFindMany() {
    const res = await prisma.informasiUmum.findMany();
    return {
        data: res
    }
}