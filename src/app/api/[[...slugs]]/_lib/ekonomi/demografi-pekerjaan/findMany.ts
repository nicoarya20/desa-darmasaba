import prisma from "@/lib/prisma";

export default async function demografiPekerjaanFindMany() {
    const res = await prisma.dataDemografiPekerjaan.findMany();
    return {
        data: res
    }
}