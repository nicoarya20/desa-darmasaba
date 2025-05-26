import prisma from "@/lib/prisma";

export default async function daftarInformasiPublikFindMany() {
    const res = await prisma.daftarInformasiPublik.findMany();
    return {
        data: res
    }
}
    