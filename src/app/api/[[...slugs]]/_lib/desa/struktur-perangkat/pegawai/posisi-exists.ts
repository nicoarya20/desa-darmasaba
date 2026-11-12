import prisma from "@/lib/prisma";

/** True bila jabatan dengan id tersebut ada (cek sebelum create/update agar 400 jelas, bukan FK error). */
export async function posisiExists(posisiId: string): Promise<boolean> {
  const posisi = await prisma.posisiPerangkatDesa.findUnique({ where: { id: posisiId }, select: { id: true } });
  return posisi !== null;
}
