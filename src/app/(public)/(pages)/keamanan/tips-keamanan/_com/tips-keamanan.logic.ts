import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { hasHtmlContent } from "../../keamanan-lingkungan-pecalang-patwal/_com/keamanan-lingkungan.logic";
import { TIPS_KEAMANAN_BASE_HREF } from "./tips-keamanan.meta";

/** Bentuk minimal item tips keamanan (`/api/keamanan/menutipskeamanan/find-many`). */
export type TipsKeamananApiItem = {
  id: string;
  judul: string;
  /** HTML editor admin, umumnya daftar butir (`<ul><li>`). */
  deskripsi?: string | null;
  image?: { link?: string | null } | null;
};

/** Satu tips siap tampil; `html`/`imageUrl` tidak ada bila kosong di data (tidak diganti placeholder). */
export type Tip = {
  id: string;
  title: string;
  html?: string;
  imageUrl?: string;
};

export function toTip(item: TipsKeamananApiItem): Tip {
  return {
    id: item.id,
    title: item.judul.trim(),
    html: hasHtmlContent(item.deskripsi) ? item.deskripsi : undefined,
    imageUrl: item.image?.link || undefined,
  };
}

/**
 * Kolom cari tampil bila kata kunci sedang aktif (agar bisa dihapus) atau tips lebih dari ambang.
 * Selama memuat/galat tanpa kata kunci → disembunyikan (jumlah belum diketahui).
 */
export function tipsSearchable(search: string, total: number | null, threshold: number): boolean {
  return search !== "" || (total !== null && total > threshold);
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function tipsKeamananListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(TIPS_KEAMANAN_BASE_HREF, opts);
}
