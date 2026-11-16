import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { isIconKey, type IconKey } from "@/app/admin/(dashboard)/_com/iconMap";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { DATA_LINGKUNGAN_BASE_HREF } from "./data-lingkungan.meta";
import { DATA_LINGKUNGAN_TEXT as T } from "./data-lingkungan.text";

/** Bentuk minimal item `/api/lingkungan/datalingkungandesa/find-many` (urut `createdAt` terbaru). */
export type DataLingkunganApiItem = {
  id: string;
  name: string;
  /** Teks bebas dari admin, mis. "1 paket kegiatan" (bukan angka). */
  jumlah?: string | null;
  /** Teks/HTML editor admin. */
  deskripsi?: string | null;
  /** Kunci ikon `IconMapper` (admin `_com/iconMap`). */
  icon?: string | null;
};

/** Satu baris siap tampil; field opsional tidak ada bila kosong di data (tanpa placeholder). */
export type DataLingkungan = {
  id: string;
  title: string;
  /** `jumlah` apa adanya (tanpa awalan karangan frontend). */
  amount?: string;
  /** HTML deskripsi yang sudah disaring. */
  html?: string;
  /** Hanya kunci ikon yang dikenal; kunci tak dikenal (stg: "icon-test") → baris tanpa ikon. */
  icon?: IconKey;
  /** Teks gabungan huruf kecil untuk cari di klien. */
  searchText: string;
};

export function toDataLingkungan(
  item: DataLingkunganApiItem,
  sanitize: (html: string) => string = sanitizeRichText,
): DataLingkungan {
  const title = item.name.trim();
  const amount = item.jumlah?.trim() || undefined;
  const plain = htmlToPlainText(item.deskripsi);
  const html = plain && item.deskripsi ? sanitize(item.deskripsi) : "";
  const icon = item.icon?.trim() ?? "";
  return {
    id: item.id,
    title,
    amount,
    html: html || undefined,
    icon: isIconKey(icon) ? icon : undefined,
    searchText: [title, amount, plain].filter(Boolean).join(" ").toLowerCase(),
  };
}

/** Saring di klien: semua kata kunci harus muncul di nama, jumlah, atau deskripsi (tidak peka huruf besar). */
export function filterDataLingkungan(items: readonly DataLingkungan[], search: string): DataLingkungan[] {
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => words.every((word) => item.searchText.includes(word)));
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function dataLingkunganListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(DATA_LINGKUNGAN_BASE_HREF, opts);
}

/** Pesan daftar kosong: bedakan galat, cari tanpa hasil, dan belum ada data. */
export function dataLingkunganEmptyMessage(search: string, failed: boolean): string {
  if (failed) return T.error;
  const query = search.trim();
  return query ? T.emptySearch(query) : T.empty;
}
