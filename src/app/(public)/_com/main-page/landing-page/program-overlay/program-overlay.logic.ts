/**
 * Logika murni overlay detail Program Inovasi: baca respons findUnique, jumlah foto dari item rel (findMany),
 * keadaan tampilan (kerangka / tidak tersedia / detail + galeri), dan navigasi foto di tampilan besar.
 */
import type { Prisma } from "@prisma/client";
import type { ProgramInovasiItem } from "../HeroPrograms";

/** Respons `GET /api/landingpage/programinovasi/:id` (logo `image` + galeri `images`). */
export type ProgramInovasiDetail = Prisma.ProgramInovasiGetPayload<{ include: { image: true; images: true } }>;

/** Hasil muat detail untuk satu id; `data: null` = tidak ditemukan atau nonaktif. */
export type DetailState =
  | { id: string; status: "ready"; data: ProgramInovasiDetail | null }
  | { id: string; status: "error" };

export type OverlayPhoto = { key: string; link: string };

/** Bagian kepala + deskripsi; sama untuk item rel (preview) dan detail lengkap. */
export type ProgramHead = { name: string; logo: string | null; description: string | null };

export type GalleryView =
  | { kind: "none" }
  | { kind: "loading"; count: number }
  | { kind: "error" }
  | { kind: "photos"; photos: OverlayPhoto[] };

export type OverlayView =
  | { kind: "skeleton" }
  | { kind: "unavailable" }
  | { kind: "detail"; head: ProgramHead; gallery: GalleryView };

/** Batas ubin kerangka galeri (2 baris desktop, 3 baris ponsel). */
export const GALLERY_SKELETON_MAX = 6;
/** Ubin kerangka bila jumlah foto tidak diketahui (satu baris desktop). */
export const GALLERY_SKELETON_FALLBACK = 3;
/** Geser horizontal minimum (px) di tampilan besar untuk pindah foto. */
export const SWIPE_THRESHOLD = 48;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validasi respons detail. 404 / `success:false` / tanpa data / `isActive:false` → `null` (tidak ditemukan);
 * status lain di luar 200 atau badan tidak valid → Error berkonteks id + HTTP.
 * Catatan: API saat ini melempar (HTTP 500) untuk id yang tidak ada, jadi kasus itu ikut jadi galat.
 */
export function readProgramDetail(id: string, status: number, body: unknown): ProgramInovasiDetail | null {
  if (status === 404) return null;
  if (status !== 200 || !isRecord(body)) {
    throw new Error(`detail program inovasi ${id} gagal (HTTP ${status}): respons tidak valid`);
  }
  if (body.success !== true || !isRecord(body.data)) return null;
  if (body.data.isActive === false) return null;
  return body.data as ProgramInovasiDetail;
}

/** Jumlah foto dokumentasi dari `_count.images` item findMany (tidak ada di tipe `ProgramInovasiItem`). */
export function previewPhotoCount(preview: unknown): number | null {
  if (!isRecord(preview) || !isRecord(preview._count)) return null;
  const count = preview._count.images;
  return typeof count === "number" && Number.isInteger(count) && count >= 0 ? count : null;
}

/** Banyak ubin kerangka galeri: 0 foto → 0, tak diketahui → `GALLERY_SKELETON_FALLBACK`, maks `GALLERY_SKELETON_MAX`. */
export function gallerySkeletonCount(count: number | null): number {
  if (count === null) return GALLERY_SKELETON_FALLBACK;
  return Math.min(count, GALLERY_SKELETON_MAX);
}

/** Foto galeri yang punya tautan, urutan dari API. */
export function dokumentasiPhotos(images: { id: string; link: string | null }[] | null | undefined): OverlayPhoto[] {
  return (images ?? []).flatMap((img) => {
    const link = img.link?.trim();
    return link ? [{ key: img.id, link }] : [];
  });
}

type HeadSource = { name: string; description?: string | null; image?: { link: string | null } | null };

export function toProgramHead(item: HeadSource): ProgramHead {
  return { name: item.name, logo: item.image?.link?.trim() || null, description: item.description ?? null };
}

/**
 * Apa yang ditampilkan overlay untuk `id`. Preview (item rel) hanya dipakai bila id-nya sama; hasil muat untuk
 * id lain dianggap belum ada (masih memuat).
 * - Detail siap → kepala dari detail; galeri foto atau tidak dirender bila kosong. Tidak ditemukan → tidak tersedia.
 * - Masih memuat + preview → kepala dari preview, galeri kerangka (tanpa kerangka bila preview bilang 0 foto).
 * - Galat + preview → kepala dari preview, kotak galat galeri hanya bila preview tahu ada foto (`_count > 0`).
 * - Tanpa preview → kerangka saat memuat, tidak tersedia saat galat.
 */
export function overlayView(
  id: string | null,
  preview: ProgramInovasiItem | undefined,
  state: DetailState | null,
): OverlayView {
  const match = preview && preview.id === id ? preview : undefined;
  const settled = state && state.id === id ? state : null;

  if (settled?.status === "ready") {
    if (!settled.data) return { kind: "unavailable" };
    const photos = dokumentasiPhotos(settled.data.images);
    return {
      kind: "detail",
      head: toProgramHead(settled.data),
      gallery: photos.length > 0 ? { kind: "photos", photos } : { kind: "none" },
    };
  }
  if (!match) return settled ? { kind: "unavailable" } : { kind: "skeleton" };

  const head = toProgramHead(match);
  const count = previewPhotoCount(match);
  if (settled) return { kind: "detail", head, gallery: count !== null && count > 0 ? { kind: "error" } : { kind: "none" } };
  const skeleton = gallerySkeletonCount(count);
  return { kind: "detail", head, gallery: skeleton > 0 ? { kind: "loading", count: skeleton } : { kind: "none" } };
}

/** Indeks foto setelah sebelumnya/berikutnya; berhenti di ujung (tanpa putar ulang). */
export function stepPhoto(index: number, delta: -1 | 1, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index + delta, 0), total - 1);
}

/** Arah geser sentuh: ke kiri = berikutnya (1), ke kanan = sebelumnya (-1), lainnya 0 (terlalu pendek / vertikal). */
export function swipeStep(dx: number, dy: number, threshold = SWIPE_THRESHOLD): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}
