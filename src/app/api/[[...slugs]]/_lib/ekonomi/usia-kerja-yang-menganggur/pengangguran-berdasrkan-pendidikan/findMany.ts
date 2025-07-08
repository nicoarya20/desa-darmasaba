import prisma from "@/lib/prisma";

export default async function grafikMenganggurBerdasarkanPendidikanFindMany() {
    const res = await prisma.grafikMenganggurBerdasarkanPendidikan.findMany();
    return {
        data: res
    }
}