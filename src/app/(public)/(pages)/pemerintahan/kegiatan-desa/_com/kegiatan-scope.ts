import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { kegiatanListHref } from "./kegiatan-list.logic";
import { loadKegiatanPage } from "./kegiatan-list.source";
import { KEGIATAN_TEXT, type KegiatanText } from "./kegiatan.text";

/**
 * Cakupan halaman daftar kegiatan: sumber data, URL daftar, teks, dan ada/tidaknya pil kategori.
 * Kegiatan Desa memakai semua kategori; Gotong Royong (`/lingkungan/gotong-royong`) satu kategori tetap.
 */
export type KegiatanScope = {
  /** Muat satu halaman; harus fungsi tingkat modul (stabil) karena dipakai sebagai dependensi efek. */
  load: (query: KabarPageQuery) => Promise<KabarPage>;
  /** URL daftar untuk slug kategori aktif (diabaikan bila tanpa pil) + `?search=&page=`. */
  listHref: (slug: string, opts?: { search?: string; page?: number }) => string;
  /** `true` = pil kategori tampil dan kategori dibaca dari segmen URL; `false` = tanpa pil. */
  withKategori: boolean;
  text: KegiatanText;
};

/** Kegiatan Desa (`/pemerintahan/kegiatan-desa/*`): semua kategori, pil kategori dari URL. */
export const KEGIATAN_DESA_SCOPE: KegiatanScope = {
  load: loadKegiatanPage,
  listHref: kegiatanListHref,
  withKategori: true,
  text: KEGIATAN_TEXT,
};
