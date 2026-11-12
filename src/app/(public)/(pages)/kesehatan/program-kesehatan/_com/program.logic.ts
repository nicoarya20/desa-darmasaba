import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { htmlToText, type KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { PROGRAM_BASE_HREF } from "./program.meta";

/** Bentuk minimal item program kesehatan (`/api/kesehatan/programkesehatan/find-many` dan `/:id`). */
export type ProgramApiItem = {
  id: string;
  name: string;
  /** HTML editor admin. */
  deskripsiSingkat?: string | null;
  /** HTML editor admin (isi detail). */
  deskripsi?: string | null;
  /** Angka indikator (0–100). Default DB 0; form admin tidak punya input ini. */
  persentase?: number | null;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  image?: { link?: string | null } | null;
};

/**
 * Entri "indikator" (mis. Imunisasi Lengkap 92%) = `persentase` > 0 **dan** tanpa foto. Disaring dari daftar halaman
 * (keputusan user 2026-11-12: metrik kesehatan tampil di Ringkasan Posyandu dari data nyata, bukan di sini).
 * Alasan: kolom `persentase` default 0 dan form admin (create/update) tidak bisa mengisinya, sedangkan form admin
 * mewajibkan gambar; jadi program/kegiatan buatan admin selalu 0 + berfoto. Entri berpersentase tanpa foto hanya
 * berasal dari data statistik (seed). Tidak memakai nama entri, supaya indikator baru ikut terbaca.
 * Entri berfoto tetap kartu kegiatan meski punya persentase (fotonya yang ditampilkan admin).
 */
export function isIndikator(item: Pick<ProgramApiItem, "persentase" | "image">): boolean {
  const persen = item.persentase;
  return typeof persen === "number" && Number.isFinite(persen) && persen > 0 && !item.image?.link;
}

/** URL detail `/kesehatan/program-kesehatan/{id}`. */
export function programDetailHref(id: string): string {
  return `${PROGRAM_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function programListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(PROGRAM_BASE_HREF, opts);
}

/** Program/kegiatan → kartu gaya Berita (tanggal kartu = tanggal entri dibuat; tidak ada tanggal pelaksanaan). */
export function toProgramItem(item: ProgramApiItem): KabarItem {
  return {
    id: item.id,
    title: item.name.trim(),
    summary: htmlToText(item.deskripsiSingkat),
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: programDetailHref(item.id),
  };
}

/** Kartu kegiatan dari hasil find-many: entri indikator dibuang, urutan API dipertahankan. */
export function toKegiatanList(items: readonly ProgramApiItem[]): KabarItem[] {
  return items.filter((item) => !isIndikator(item)).map(toProgramItem);
}

/** Satu halaman dari daftar di klien; halaman di luar jangkauan → halaman terakhir. */
export function paginate<T>(items: readonly T[], page: number, size: number): { items: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((current - 1) * size, current * size), page: current, totalPages };
}

/** Angka persen tampilan detail indikator, mis. `92%` / `8,5%` (format Indonesia). */
export function formatPersen(value: number): string {
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
}
