import prisma from "@/lib/prisma";
import { PROFIL_POSYANDU_ID } from "@/lib/posyandu/posyandu-konten.validation";
import type { ProfilPosyanduData } from "@/lib/posyandu/posyandu-konten.types";

/** Nama model untuk konteks log hapus berkas gambar klaster. */
export const KLASTER_FILE_OWNER = "KlasterPosyandu";

/** Field klaster yang dikirim ke klien (kontrak `KlasterPosyanduItem`). */
export const KLASTER_SELECT = {
  id: true,
  sasaran: true,
  judul: true,
  deskripsi: true,
  jamPelayanan: true,
  urutan: true,
  imageId: true,
  image: { select: { id: true, name: true, link: true } },
} as const;

/** Profil posyandu (singleton) + semua klaster urut tampil; profil null bila admin belum mengisi. */
export async function muatProfilPosyandu(): Promise<ProfilPosyanduData> {
  const [profil, klaster] = await Promise.all([
    prisma.profilPosyandu.findUnique({
      where: { id: PROFIL_POSYANDU_ID },
      select: { deskripsi: true, fungsiKegiatan: true },
    }),
    prisma.klasterPosyandu.findMany({ select: KLASTER_SELECT, orderBy: [{ urutan: "asc" }, { sasaran: "asc" }] }),
  ]);
  return { profil, klaster: klaster as ProfilPosyanduData["klaster"] };
}
