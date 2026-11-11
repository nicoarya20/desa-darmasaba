/**
 * Aturan data API Berita (urutan list + bentuk data Prisma create/update) — fungsi murni tanpa DB,
 * dipakai handler `_lib/desa/berita`, modul search, dan `/api/news/latest` supaya urutan satu sumber.
 * Keputusan: docs/decisions/2026-11-11-berita-tanggal-terbit.md.
 */
import type { Prisma } from "@prisma/client";

/** Urutan list: tanggal terbit terbaru, lalu yang dibuat terakhir untuk tanggal yang sama. */
export const BERITA_LIST_ORDER_BY = [
  { tanggalTerbit: "desc" },
  { createdAt: "desc" },
] satisfies Prisma.BeritaOrderByWithRelationInput[];

/** Body create/update (field lama tetap; `tanggalTerbit` opsional — kontrak additive). */
export type BeritaBody = {
  judul: string;
  deskripsi: string;
  content: string;
  kategoriBeritaId: string | null;
  /** Gambar utama; kosong = tanpa gambar (update: dilepas). */
  imageId: string;
  /** Galeri. Create: di-connect bila ada; update: undefined = tidak diubah, array = set final. */
  imageIds?: string[];
  linkVideo?: string;
  /** `YYYY-MM-DD` (WITA) atau ISO; kosong = default sekarang (create) / tidak diubah (update). */
  tanggalTerbit?: string | null;
};

/** Data `prisma.berita.create`; `tanggalTerbit` undefined → default DB (sekarang). */
export function susunBeritaCreate(
  body: BeritaBody,
  tanggalTerbit: Date | undefined,
): Prisma.BeritaUncheckedCreateInput {
  return {
    content: body.content,
    deskripsi: body.deskripsi,
    imageId: body.imageId,
    judul: body.judul,
    kategoriBeritaId: body.kategoriBeritaId,
    linkVideo: body.linkVideo,
    images: body.imageIds && body.imageIds.length > 0 ? { connect: body.imageIds.map((id) => ({ id })) } : undefined,
    ...(tanggalTerbit ? { tanggalTerbit } : {}),
  };
}

/** Data `prisma.berita.update`; galeri & tanggal hanya diubah bila dikirim. */
export function susunBeritaUpdate(
  body: BeritaBody,
  tanggalTerbit: Date | undefined,
): Prisma.BeritaUpdateInput {
  const { judul, deskripsi, content, kategoriBeritaId, imageId, imageIds, linkVideo } = body;
  const data: Prisma.BeritaUpdateInput = {
    judul,
    deskripsi,
    content,
    kategoriBerita: kategoriBeritaId ? { connect: { id: kategoriBeritaId } } : { disconnect: true },
    image: imageId ? { connect: { id: imageId } } : { disconnect: true },
    linkVideo,
    ...(tanggalTerbit ? { tanggalTerbit } : {}),
  };
  if (imageIds !== undefined) {
    // `set: []` melepas semua galeri lama, lalu connect set baru (perilaku sebelum tanggalTerbit).
    data.images = imageIds.length > 0 ? { set: [], connect: imageIds.map((id) => ({ id })) } : { set: [] };
  }
  return data;
}
