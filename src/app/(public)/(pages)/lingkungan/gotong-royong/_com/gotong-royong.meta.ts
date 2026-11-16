import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { kegiatanDetailHref } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.logic";

/**
 * URL daftar Gotong Royong. Tetap `/semua` (bukan `/lingkungan/gotong-royong`) karena dipakai navbar dan menjadi
 * kunci `MenuVisibility.menuKey`; `/lingkungan/gotong-royong` dialihkan ke sini.
 */
export const GOTONG_ROYONG_LIST_PATH = "/lingkungan/gotong-royong/semua";

/** Nama kategori untuk segmen kosmetik URL detail (data detail dibaca dari `id`). */
const GOTONG_ROYONG_KATEGORI_NAMA = "Gotong Royong";

/** URL daftar Gotong Royong + `?search=&page=`; slug kategori diabaikan (hanya satu kategori). */
export function gotongRoyongListHref(_slug: string, opts: { search?: string; page?: number } = {}): string {
  return withListQuery(GOTONG_ROYONG_LIST_PATH, opts);
}

/** URL detail gotong royong = detail Kegiatan Desa (`/pemerintahan/kegiatan-desa/gotong%20royong/{id}`). */
export function gotongRoyongDetailHref(id: string): string {
  return kegiatanDetailHref(GOTONG_ROYONG_KATEGORI_NAMA, id);
}
