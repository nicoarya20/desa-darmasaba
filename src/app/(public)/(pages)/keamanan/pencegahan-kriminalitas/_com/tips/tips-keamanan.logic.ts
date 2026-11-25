import { hasHtmlContent } from "@/app/(public)/(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/_com/keamanan-lingkungan.logic";
import { pencegahanListHref } from "../pencegahan.logic";
import { TIPS_SECTION_ID } from "./tips-keamanan.meta";

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
 * Tujuan alamat lama `/keamanan/tips-keamanan[?search=…]`: bagian tips di halaman Pencegahan Kriminalitas,
 * kata kunci dipertahankan (menu Tips Keamanan dilebur ke Pencegahan Kriminalitas 2026-11-24).
 */
export function tipsKeamananHref(search = ""): string {
  return `${pencegahanListHref({ search: search.trim() })}#${TIPS_SECTION_ID}`;
}
