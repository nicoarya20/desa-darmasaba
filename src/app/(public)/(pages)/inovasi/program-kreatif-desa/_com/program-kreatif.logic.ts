import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { PROGRAM_KREATIF_BASE_HREF } from "./program-kreatif.meta";

/** Bentuk minimal item program kreatif (`/api/inovasi/programkreatif/find-many` dan `/:id`). */
export type ProgramKreatifApiItem = {
  id: string;
  name: string;
  /** Deskripsi singkat, teks polos dari input admin (nama kolom DB `slug`, bukan slug URL). */
  slug?: string | null;
  /** HTML editor admin (isi detail). */
  deskripsi?: string | null;
  /** Kunci ikon `IconMapper` (admin `_com/iconMap`). */
  icon?: string | null;
  createdAt: string | Date;
};

/** Satu program siap tampil sebagai ubin daftar. */
export type ProgramKreatifItem = {
  id: string;
  title: string;
  summary: string;
  /** Kunci ikon; kosong → ubin tanpa ikon. */
  icon?: string;
  href: string;
};

/** URL detail `/inovasi/program-kreatif-desa/{id}`. */
export function programKreatifDetailHref(id: string): string {
  return `${PROGRAM_KREATIF_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function programKreatifListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(PROGRAM_KREATIF_BASE_HREF, opts);
}

export function toProgramKreatifItem(item: ProgramKreatifApiItem): ProgramKreatifItem {
  return {
    id: item.id,
    title: item.name.trim(),
    summary: item.slug?.trim() ?? "",
    icon: item.icon?.trim() || undefined,
    href: programKreatifDetailHref(item.id),
  };
}

/**
 * Kolom cari tampil bila kata kunci sedang aktif (agar bisa dihapus) atau program lebih dari ambang (aturan sama dengan
 * Tips Keamanan). Selama memuat/galat tanpa kata kunci → disembunyikan (jumlah belum diketahui).
 */
export function programKreatifSearchable(search: string, total: number | null, threshold: number): boolean {
  return search !== "" || (total !== null && total > threshold);
}

/**
 * Pesan API detail berarti "tidak ditemukan". MITIGASI SEMENTARA: `GET /api/inovasi/programkreatif/:id` membalas
 * HTTP 200 + `success:false` (bukan 404) untuk id yang tidak ada, sama bentuknya dengan galat server; pembedanya hanya
 * pesan. Hapus bila API membalas 404 (dicatat untuk backend).
 */
export function isNotFoundMessage(message: string | null | undefined): boolean {
  return /tidak ditemukan/i.test(message ?? "");
}
