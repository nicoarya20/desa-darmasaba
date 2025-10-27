import prisma from "@/lib/prisma"

export default async function preventionFindMany() {
    const res = await prisma.prevention.findMany()
    return {
        data: res
    }
}