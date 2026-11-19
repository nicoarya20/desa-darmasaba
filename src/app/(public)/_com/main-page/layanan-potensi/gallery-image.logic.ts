/**
 * Pemuatan foto kartu galeri (juknis lomba 5.4): section ini jauh di bawah lipatan, jadi foto tidak boleh ikut
 * diunduh saat halaman dibuka. Track loop menduplikasi kartu (≥ 3 salinan), dan kartu di luar viewport baris
 * terpotong `overflow: hidden`, sehingga `loading="lazy"` baru memuatnya SETELAH slide masuk (kotak gelap sesaat).
 * Karena itu kartu di sekitar kartu aktif dimuat lebih awal (eager) begitu section mendekati layar.
 */

export type GalleryVariant = "feature" | "tile";

/**
 * Jarak maksimal (dalam kartu) dari kartu aktif yang dimuat lebih awal: kartu yang terlihat + satu kartu di
 * luarnya sehingga kartu yang akan masuk di slide berikutnya (maju/mundur) sudah siap. `feature`: 1 kartu mengintip
 * tiap sisi (desktop/tablet/ponsel); `tile`: sampai 3 kartu tiap sisi di desktop (18,4% per kartu).
 */
export const PRELOAD_DISTANCE: Readonly<Record<GalleryVariant, number>> = { feature: 2, tile: 4 };

/**
 * `sizes` foto kartu per breakpoint (gallery.module.css). Di ponsel kartu berpotret (feature 550/992, tile 3/4) dan
 * foto lanskap 16:9 `object-fit: cover` diskalakan mengikuti TINGGI kartu, sehingga lebar yang dibutuhkan jauh di
 * atas lebar kartu (feature 69vw × 992/550 × 16/9 ≈ 220vw; tile 47vw × 4/3 × 16/9 ≈ 112vw).
 */
export const GALLERY_IMAGE_SIZES: Readonly<Record<GalleryVariant, string>> = {
  feature: "(max-width: 734px) 220vw, (max-width: 1068px) 64vw, 49vw",
  tile: "(max-width: 734px) 112vw, (max-width: 1068px) 28vw, 18.4vw",
};

/** Eager untuk kartu di sekitar kartu aktif setelah section mendekati layar (`preload`); selebihnya lazy. */
export function galleryImageLoading(
  trackIndex: number,
  activeIndex: number,
  variant: GalleryVariant,
  preload: boolean,
): "eager" | "lazy" {
  if (!preload) return "lazy";
  return Math.abs(trackIndex - activeIndex) <= PRELOAD_DISTANCE[variant] ? "eager" : "lazy";
}
