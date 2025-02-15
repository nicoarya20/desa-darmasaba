import prisma from "@/lib/prisma";

async function getPotensi() {
    const data = await prisma.potensi.findMany()
    return {
        data
    }
}

export default getPotensi