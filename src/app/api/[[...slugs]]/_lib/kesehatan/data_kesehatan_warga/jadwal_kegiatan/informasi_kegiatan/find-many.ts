import prisma from "@/lib/prisma";

export default async function informasiJadwalKegiatanFindMany() {
    const res = await prisma.informasiJadwalKegiatan.findMany();
    return {
        data: res
    }
}