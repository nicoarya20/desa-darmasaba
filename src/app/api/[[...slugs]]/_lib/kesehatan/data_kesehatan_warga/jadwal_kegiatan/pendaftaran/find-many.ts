import prisma from "@/lib/prisma";

export default async function PendaftaranJadwalFindMany() {
  const res = await prisma.pendaftaranJadwalKegiatan.findMany();
  return {
    data: res,
  };
}
