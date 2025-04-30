import prisma from "@/lib/prisma";

export default async function dokterDantenagamedisFindMany() {
    const res = await prisma.dokterdanTenagaMedis.findMany();
    return {
        data: res
    }
}