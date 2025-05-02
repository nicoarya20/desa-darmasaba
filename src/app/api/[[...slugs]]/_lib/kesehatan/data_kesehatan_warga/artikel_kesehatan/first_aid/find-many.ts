import prisma from "@/lib/prisma"

export default async function firstAidFindMany() {
    const res = await prisma.firstAid.findMany()
    return {
        data: res
    }
}