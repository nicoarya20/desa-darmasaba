import prisma from "@/lib/prisma";

export default async function grafikMenganggurBerdasarkanUsiaFindMany() {
    const res = await prisma.grafikMenganggurBerdasarkanUsia.findMany();
    return {
        data: res
    }
}