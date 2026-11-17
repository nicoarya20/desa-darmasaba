import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { isIconKey, type IconKey } from "@/app/admin/(dashboard)/_com/iconMap";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { PROGRAM_KEMISKINAN_BASE_HREF } from "./program-kemiskinan.meta";
import { PROGRAM_KEMISKINAN_TEXT as T } from "./program-kemiskinan.text";

/**
 * Bentuk minimal item `/api/ekonomi/programkemiskinan/find-many` (urut `createdAt` terbaru). Relasi `statistik`
 * ({ tahun, jumlah }) sengaja tidak dibaca: artinya belum jelas (form admin "jumlah masyarakat miskin", tetapi angkanya
 * 20/30/20 bertentangan dengan Jumlah Penduduk Miskin 430/410/390), jadi tidak ditampilkan agar tidak menyesatkan.
 */
export type ProgramKemiskinanApiItem = {
  id: string;
  nama: string;
  /** Penanda URL detail (unik, opsional); kosong → detail dibuka lewat id. */
  slug?: string | null;
  /** HTML editor admin. */
  deskripsi?: string | null;
  /** Kunci ikon `IconMapper` (admin `_com/iconMap`). */
  icon?: string | null;
};

/** Satu baris siap tampil; field opsional tidak ada bila kosong di data. */
export type ProgramKemiskinan = {
  id: string;
  title: string;
  /** Halaman detail publik (deskripsi + penerima per tahun), lihat `programHref`. */
  href: string;
  /** HTML deskripsi yang sudah disaring. */
  html?: string;
  /** Hanya kunci ikon yang dikenal; kunci tak dikenal → baris tanpa ikon (bukan tanda tanya). */
  icon?: IconKey;
  /** Teks gabungan huruf kecil untuk cari di klien. */
  searchText: string;
};

export function toProgramKemiskinan(
  item: ProgramKemiskinanApiItem,
  sanitize: (html: string) => string = sanitizeRichText,
): ProgramKemiskinan {
  const title = item.nama.trim();
  const plain = htmlToPlainText(item.deskripsi);
  const html = plain && item.deskripsi ? sanitize(item.deskripsi) : "";
  const icon = item.icon?.trim() ?? "";
  return {
    id: item.id,
    title,
    href: programHref(item),
    html: html || undefined,
    icon: isIconKey(icon) ? icon : undefined,
    searchText: [title, plain].filter(Boolean).join(" ").toLowerCase(),
  };
}

/** Saring di klien: semua kata kunci harus muncul di nama atau deskripsi (tidak peka huruf besar). */
export function filterProgramKemiskinan(items: readonly ProgramKemiskinan[], search: string): ProgramKemiskinan[] {
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => words.every((word) => item.searchText.includes(word)));
}

/** URL detail publik program: slug bila ada, selain itu id. */
export function programHref(p: { id: string; slug?: string | null }): string {
  return `${PROGRAM_KEMISKINAN_BASE_HREF}/${encodeURIComponent(p.slug?.trim() || p.id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function programKemiskinanListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(PROGRAM_KEMISKINAN_BASE_HREF, opts);
}

/** Pesan daftar kosong: bedakan galat, cari tanpa hasil, dan belum ada data. */
export function programKemiskinanEmptyMessage(search: string, failed: boolean): string {
  if (failed) return T.error;
  const query = search.trim();
  return query ? T.emptySearch(query) : T.empty;
}
