import prisma from "@/lib/prisma"

export default async function grafikKepuasanFindMany() {
    const res = await prisma.grafikKepuasan.findMany()
    return {
        data: res
    }
}    