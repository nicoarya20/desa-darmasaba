import { z } from "zod";
import { buatSkemaGaleri, MAX_KETERANGAN_FOTO_GALERI } from "@/lib/konten-bersama/galeri.validation";

/**
 * Batas jumlah foto galeri Profil BUMDes. Galeri ditampilkan utuh di satu section publik,
 * jadi jumlahnya dibatasi di sini (bukan dipaginasi) agar list tetap ringan.
 */
export const MAX_FOTO_GALERI = 50;
export const MAX_KETERANGAN_FOTO = MAX_KETERANGAN_FOTO_GALERI;

const skemaGaleriBumdes = buatSkemaGaleri({ max: MAX_FOTO_GALERI, maxKeterangan: MAX_KETERANGAN_FOTO });

/** Skema body POST galeri: daftar foto yang sudah diunggah ke FileStorage. */
export const fotoProfilCreateSchema = skemaGaleriBumdes.create;

/** Skema body PUT keterangan satu foto; null/"" menghapus keterangan. */
export const fotoProfilUpdateSchema = skemaGaleriBumdes.update;

/** Skema body PUT urutan: seluruh id foto galeri aktif, urut dari atas ke bawah. */
export const fotoProfilReorderSchema = skemaGaleriBumdes.reorder;

export type FotoProfilCreateInput = z.infer<typeof fotoProfilCreateSchema>;
