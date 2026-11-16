import { detailHref } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { BERITA_BASE_HREF, BERITA_LIST_HREF, PENGUMUMAN_BASE_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";

/** Jenis detail lama di bawah `/inovasi/layanan-online-desa/informasi-desa/detail-*`. */
export type InformasiKind = "berita" | "pengumuman";

/** Hasil pemeriksaan item: ada (dengan nama kategori), tidak ada, atau gagal diperiksa (jaringan/server). */
export type InformasiLookup = { status: "found"; kategori?: string | null } | { status: "missing" } | { status: "error" };

const BASE: Record<InformasiKind, { detail: string; list: string }> = {
  berita: { detail: BERITA_BASE_HREF, list: BERITA_LIST_HREF },
  pengumuman: { detail: PENGUMUMAN_BASE_HREF, list: PENGUMUMAN_BASE_HREF },
};

/**
 * Tujuan alih detail lama → URL kanonik `{base}/{kategori}/{id}`. Tidak ditemukan → halaman daftar. Gagal diperiksa →
 * detail dengan kategori pengganti (segmen kategori hanya kosmetik; halaman detail menampilkan galat/404-nya sendiri).
 */
export function informasiRedirectHref(kind: InformasiKind, id: string, lookup: InformasiLookup): string {
  const base = BASE[kind];
  if (lookup.status === "missing") return base.list;
  return detailHref(base.detail, lookup.status === "found" ? lookup.kategori : undefined, id);
}

/** Halaman daftar untuk tautan cadangan selama pengalihan. */
export function informasiListHref(kind: InformasiKind): string {
  return BASE[kind].list;
}
