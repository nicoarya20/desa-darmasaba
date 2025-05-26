import prisma from "@/lib/prisma"

export default async function symptomFindMany() {
    const res = await prisma.symptom.findMany()
    return {
        data: res
    }
}