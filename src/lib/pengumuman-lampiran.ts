/**
 * Aturan body API Pengumuman (lampiran gambar/dokumen + tanggal terbit) — fungsi murni tanpa DB,
 * dipakai handler create/update dan form admin supaya batas & pesan error satu sumber.
 */
import type { Prisma } from "@prisma/client";
import { parseTanggalTerbit } from "./pengumuman-tanggal";

/** Batas gambar galeri per pengumuman (sama dengan galeri Berita). */
export const MAX_GALERI_PENGUMUMAN = 10;
/** Batas lampiran dokumen per pengumuman. */
export const MAX_DOKUMEN_PENGUMUMAN = 20;
/** Lampiran dokumen hanya PDF supaya selalu bisa dipratinjau (non-PDF disimpan ter-gzip). */
export const PENGUMUMAN_DOKUMEN_MIME = "application/pdf";

/** Field FileStorage yang dikirim ke klien untuk lampiran. */
export const PENGUMUMAN_FILE_SELECT = {
  id: true,
  link: true,
  realName: true,
  mimeType: true,
  size: true,
} satisfies Prisma.FileStorageSelect;

/** Include list (kartu): kategori + thumbnail saja, tanpa galeri/dokumen. */
export const PENGUMUMAN_LIST_INCLUDE = {
  CategoryPengumuman: true,
  image: { select: PENGUMUMAN_FILE_SELECT },
} satisfies Prisma.PengumumanInclude;

/** Include detail: kategori + gambar utama + galeri + dokumen. */
export const PENGUMUMAN_DETAIL_INCLUDE = {
  ...PENGUMUMAN_LIST_INCLUDE,
  images: { select: PENGUMUMAN_FILE_SELECT },
  dokumen: { select: PENGUMUMAN_FILE_SELECT },
} satisfies Prisma.PengumumanInclude;

/** Urutan list: tanggal terbit terbaru, lalu yang dibuat terakhir untuk tanggal yang sama. */
export const PENGUMUMAN_LIST_ORDER_BY = [
  { tanggalTerbit: "desc" },
  { createdAt: "desc" },
] satisfies Prisma.PengumumanOrderByWithRelationInput[];

/** Satu berkas lampiran dalam respons API. `size` byte, null = berkas lama belum di-backfill. */
export type PengumumanFile = Prisma.FileStorageGetPayload<{ select: typeof PENGUMUMAN_FILE_SELECT }>;
/** Item list (find-many/find-first/find-recent). */
export type PengumumanListItem = Prisma.PengumumanGetPayload<{ include: typeof PENGUMUMAN_LIST_INCLUDE }>;
/** Detail (`GET /:id`). */
export type PengumumanDetail = Prisma.PengumumanGetPayload<{ include: typeof PENGUMUMAN_DETAIL_INCLUDE }>;

/** Body create/update (field lama wajib, lampiran & tanggal opsional — kontrak additive). */
export type PengumumanBody = {
  judul: string;
  deskripsi: string;
  content: string;
  categoryPengumumanId: string | null;
  /** undefined = tidak diubah; null/"" = tanpa gambar utama. */
  imageId?: string | null;
  /** undefined = tidak diubah; array = set final galeri. */
  imageIds?: string[];
  /** undefined = tidak diubah; array = set final dokumen. */
  dokumenIds?: string[];
  /** `YYYY-MM-DD` (WITA) atau ISO; kosong = default (create) / tidak diubah (update). */
  tanggalTerbit?: string | null;
};

type Hasil<T> = { ok: true; data: T } | { ok: false; message: string };

/** Lampiran yang sudah dinormalisasi; field undefined = tidak dikirim. */
export type LampiranParsed = {
  imageId: string | null | undefined;
  imageIds: string[] | undefined;
  dokumenIds: string[] | undefined;
  tanggalTerbit: Date | undefined;
};

/** String kosong/spasi atau null → null; undefined tetap undefined (artinya "tidak diubah"). */
export function normalisasiImageId(imageId: string | null | undefined): string | null | undefined {
  if (imageId === undefined) return undefined;
  if (imageId === null) return null;
  const trimmed = imageId.trim();
  return trimmed === "" ? null : trimmed;
}

/** Buang id kosong & duplikat (urutan pertama dipertahankan), tolak bila melebihi batas. */
export function periksaIds(ids: string[] | undefined, max: number, label: string): Hasil<string[] | undefined> {
  if (ids === undefined) return { ok: true, data: undefined };
  const unik = Array.from(new Set(ids.map((id) => id.trim()).filter((id) => id !== "")));
  if (unik.length > max) {
    return { ok: false, message: `Maksimal ${max} ${label} per pengumuman (dikirim ${unik.length})` };
  }
  return { ok: true, data: unik };
}

/** Validasi & normalisasi field lampiran + tanggal dari body. */
export function parseLampiran(body: PengumumanBody): Hasil<LampiranParsed> {
  const imageIds = periksaIds(body.imageIds, MAX_GALERI_PENGUMUMAN, "gambar galeri");
  if (!imageIds.ok) return imageIds;
  const dokumenIds = periksaIds(body.dokumenIds, MAX_DOKUMEN_PENGUMUMAN, "dokumen");
  if (!dokumenIds.ok) return dokumenIds;
  const tanggal = parseTanggalTerbit(body.tanggalTerbit);
  if (!tanggal.ok) return tanggal;
  return {
    ok: true,
    data: {
      imageId: normalisasiImageId(body.imageId),
      imageIds: imageIds.data,
      dokumenIds: dokumenIds.data,
      tanggalTerbit: tanggal.data,
    },
  };
}

/** Berkas yang dirujuk body, dikelompokkan menurut perannya (untuk cek jenis & status aktif). */
export function rujukanBerkas(lampiran: LampiranParsed): { gambar: string[]; dokumen: string[] } {
  const gambar = [...(lampiran.imageId ? [lampiran.imageId] : []), ...(lampiran.imageIds ?? [])];
  return { gambar: Array.from(new Set(gambar)), dokumen: lampiran.dokumenIds ?? [] };
}

/**
 * Cocokkan rujukan dengan baris FileStorage aktif: semua harus ada, gambar ber-mime `image/*`,
 * dokumen harus PDF. `rows` = hasil satu query `findMany({ id: { in }, isActive: true })`.
 */
export function periksaBerkas(
  rujukan: { gambar: string[]; dokumen: string[] },
  rows: { id: string; mimeType: string }[],
): Hasil<null> {
  const mime = new Map(rows.map((r) => [r.id, r.mimeType]));
  for (const id of [...rujukan.gambar, ...rujukan.dokumen]) {
    if (!mime.has(id)) return { ok: false, message: `Berkas ${id} tidak ditemukan atau sudah dihapus` };
  }
  const bukanGambar = rujukan.gambar.find((id) => !mime.get(id)?.startsWith("image/"));
  if (bukanGambar) return { ok: false, message: `Berkas ${bukanGambar} bukan gambar` };
  const bukanPdf = rujukan.dokumen.find((id) => mime.get(id) !== PENGUMUMAN_DOKUMEN_MIME);
  if (bukanPdf) return { ok: false, message: `Dokumen ${bukanPdf} harus berformat PDF` };
  return { ok: true, data: null };
}

/** Data `prisma.pengumuman.create`: lampiran di-connect bila ada; tanggal kosong → default DB. */
export function susunDataCreate(
  body: PengumumanBody,
  lampiran: LampiranParsed,
): Prisma.PengumumanUncheckedCreateInput {
  return {
    judul: body.judul,
    deskripsi: body.deskripsi,
    content: body.content,
    categoryPengumumanId: body.categoryPengumumanId || null,
    imageId: lampiran.imageId ?? null,
    ...(lampiran.tanggalTerbit ? { tanggalTerbit: lampiran.tanggalTerbit } : {}),
    ...(lampiran.imageIds?.length ? { images: { connect: lampiran.imageIds.map((id) => ({ id })) } } : {}),
    ...(lampiran.dokumenIds?.length ? { dokumen: { connect: lampiran.dokumenIds.map((id) => ({ id })) } } : {}),
  };
}

/** Data `prisma.pengumuman.update`: field lampiran/tanggal hanya diubah bila dikirim; galeri/dokumen = `set`. */
export function susunDataUpdate(
  body: PengumumanBody,
  lampiran: LampiranParsed,
): Prisma.PengumumanUncheckedUpdateInput {
  return {
    judul: body.judul,
    deskripsi: body.deskripsi,
    content: body.content,
    categoryPengumumanId: body.categoryPengumumanId || null,
    ...(lampiran.imageId !== undefined ? { imageId: lampiran.imageId } : {}),
    ...(lampiran.tanggalTerbit ? { tanggalTerbit: lampiran.tanggalTerbit } : {}),
    ...(lampiran.imageIds ? { images: { set: lampiran.imageIds.map((id) => ({ id })) } } : {}),
    ...(lampiran.dokumenIds ? { dokumen: { set: lampiran.dokumenIds.map((id) => ({ id })) } } : {}),
  };
}
