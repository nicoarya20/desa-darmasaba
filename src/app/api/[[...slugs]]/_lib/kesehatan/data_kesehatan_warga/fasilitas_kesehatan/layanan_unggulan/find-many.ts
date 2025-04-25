import prisma from "@/lib/prisma";

export default async function layananUnggulanFindMany() {
    const res = await prisma.layananUnggulan.findMany();
    return {
        data: res
    }
}