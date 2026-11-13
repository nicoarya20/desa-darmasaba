import { PROFIL_BUMDES_ID } from "@/lib/bumdes-profil";
import { IMAGE_SELECT } from "../../http";

/** Filter foto galeri yang tampil: milik profil singleton, aktif, belum dihapus. */
export const FOTO_AKTIF_WHERE = { profilId: PROFIL_BUMDES_ID, isActive: true, deletedAt: null } as const;

/** Field foto galeri yang dikirim ke klien (gambar tanpa path server). */
export const FOTO_SELECT = {
  id: true,
  imageId: true,
  keterangan: true,
  urutan: true,
  image: IMAGE_SELECT,
} as const;

/** Urutan tampil galeri: `urutan` lalu waktu dibuat (stabil untuk urutan sama). */
export const FOTO_ORDER_BY = [{ urutan: "asc" }, { createdAt: "asc" }] as const;
