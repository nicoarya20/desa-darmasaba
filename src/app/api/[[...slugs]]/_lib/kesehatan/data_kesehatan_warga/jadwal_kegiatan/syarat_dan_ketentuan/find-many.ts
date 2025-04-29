import prisma from "@/lib/prisma";

export default async function SyaratKetentuanFindMany() {
    const res = await prisma.syaratKetentuanJadwalKegiatan.findMany();
    return {
        data: res
    }
}