import prisma from "@/lib/prisma";

export default async function LayananTersediaFindMany() {
    const res = await prisma.layananJadwalKegiatan.findMany();
    return {
        data: res
    }
}