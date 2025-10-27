import prisma from "@/lib/prisma";

export default async function dataPendidikanFindMany() {
    const res = await prisma.dataPendidikan.findMany();
    return {
        data: res,
    };
}