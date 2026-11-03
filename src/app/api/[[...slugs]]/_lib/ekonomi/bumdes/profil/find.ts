import prisma from "@/lib/prisma";
import { IMAGE_SELECT } from "../http";
import { PROFIL_BUMDES_ID } from "./validation";

/** GET publik: profil BUMDes (singleton); `data: null` bila admin belum mengisi. */
export default async function profilBumDesFind() {
  const data = await prisma.profilBumDes.findFirst({
    where: { id: PROFIL_BUMDES_ID, isActive: true, deletedAt: null },
    include: { image: IMAGE_SELECT },
  });

  return {
    success: true,
    message: data ? "Berhasil mengambil profil BUMDes" : "Profil BUMDes belum diisi",
    data,
  };
}
