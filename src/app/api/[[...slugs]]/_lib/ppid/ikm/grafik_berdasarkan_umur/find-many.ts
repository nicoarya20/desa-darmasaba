import prisma from "@/lib/prisma";

export async function grafikBerdasarkanUmurFindMany(){
    const res = await prisma.grafikBerdasarkanUmur.findMany();
    return {
        data: res
    }
}