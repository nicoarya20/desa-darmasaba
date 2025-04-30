import prisma from "@/lib/prisma";

export default async function fasilitasPendukungFindMany() {
    const res = await prisma.fasilitasPendukung.findMany();
    return {
        data: res
    }
}