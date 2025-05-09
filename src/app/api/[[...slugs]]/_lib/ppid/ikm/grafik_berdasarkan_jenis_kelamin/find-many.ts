import prisma from "@/lib/prisma";

export default async function grafikBerdasarkanJenisKelaminFindMany() {
    const res = await prisma.grafikBerdasarkanJenisKelamin.findMany();
    return {
        data: res
    }
}