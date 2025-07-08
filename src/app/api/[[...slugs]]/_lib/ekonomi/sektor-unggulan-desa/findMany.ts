import prisma from "@/lib/prisma";

export default async function sektorUnggulanDesaFindMany() {
    const res = await prisma.sektorUnggulanDesa.findMany();
    return {
        data: res,
    };
}