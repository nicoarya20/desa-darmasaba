import prisma from "@/lib/prisma";

export default async function grafikRespondenFindMany(){
    const res = await prisma.grafikBerdasarkanResponden.findMany();
    return{
        data: res
    }
}