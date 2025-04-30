import prisma from "@/lib/prisma";

export default async function deskripsiJadwalKegiatanFindMany() {
    const res = await prisma.deskripsiJadwalKegiatan.findMany();
    return {
        data: res
    }
}