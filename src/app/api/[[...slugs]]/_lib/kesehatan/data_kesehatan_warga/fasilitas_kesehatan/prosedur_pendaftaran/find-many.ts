import prisma from "@/lib/prisma";

export default async function prosedurPendaftaranFindMany() {
    const res = await prisma.prosedurPendaftaran.findMany();
    return {
        data: res
    }
}