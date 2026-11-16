import { loadPengumumanDetail } from "@/app/(public)/(pages)/pemerintahan/pengumuman/_com/detail/pengumuman-detail.source";
import type { InformasiKind, InformasiLookup } from "./informasi-redirect.logic";

type BeritaBody = { success?: boolean; message?: string; data?: { kategoriBerita?: { name?: string | null } | null } | null } | null;

/** Detail berita (`GET /api/desa/berita/:id`): 404 → tidak ada; galat lain → Error berkonteks. */
async function lookupBerita(id: string): Promise<InformasiLookup> {
  const res = await fetch(`/api/desa/berita/${encodeURIComponent(id)}`);
  if (res.status === 404) return { status: "missing" };
  if (!res.ok) throw new Error(`detail berita ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as BeritaBody;
  if (!body?.success || !body.data) return { status: "missing" };
  return { status: "found", kategori: body.data.kategoriBerita?.name };
}

/** Detail pengumuman lewat sumber detail Pengumuman yang sudah ada (`null` = tidak ditemukan). */
async function lookupPengumuman(id: string): Promise<InformasiLookup> {
  const data = await loadPengumumanDetail(id);
  return data ? { status: "found", kategori: data.CategoryPengumuman?.name } : { status: "missing" };
}

/** Periksa item untuk menyusun URL kanonik; galat jaringan/server dilempar ke pemanggil. */
export function lookupInformasi(kind: InformasiKind, id: string): Promise<InformasiLookup> {
  return kind === "berita" ? lookupBerita(id) : lookupPengumuman(id);
}
