/**
 * Logika murni body API Program Inovasi (tanpa DB) — dipakai handler create/update
 * dan form admin, supaya aturan logo opsional, batas galeri dokumentasi, dan urutan tampil satu sumber.
 */
import type { Prisma } from "@prisma/client";

/** Batas jumlah gambar galeri dokumentasi per program (dicek di API dan form admin). */
export const MAX_GAMBAR_DOKUMENTASI = 20;

/** Rentang nilai `urutan` (1 = paling depan); kosong = di belakang semua yang bernomor. */
export const URUTAN_MIN = 1;
export const URUTAN_MAX = 9999;

/**
 * Urutan tampil program (rel beranda, halaman Inovasi › Program Inovasi, daftar admin):
 * `urutan` kecil dulu, yang kosong di belakang, lalu abjad nama sebagai pemecah seri.
 */
export const PROGRAM_INOVASI_ORDER_BY = [
  { urutan: { sort: "asc", nulls: "last" } },
  { name: "asc" },
] satisfies Prisma.ProgramInovasiOrderByWithRelationInput[];

/** Body create sesuai skema Elysia (link sudah tidak diterima dari form). */
export type ProgramInovasiCreateBody = {
  name: string;
  description: string;
  imageId?: string | null;
  imageIds?: string[];
  /** Urutan tampil; null = kosongkan (kembali urut abjad di belakang). */
  urutan?: number | null;
};

/** Body update: semua field opsional; `imageIds` absen = galeri tidak diubah. */
export type ProgramInovasiUpdateBody = Partial<ProgramInovasiCreateBody>;

type Hasil<T> = { ok: true; data: T } | { ok: false; message: string };

/** String kosong/spasi atau null → null; undefined tetap undefined (artinya "tidak diubah"). */
export function normalisasiImageId(
  imageId: string | null | undefined
): string | null | undefined {
  if (imageId === undefined) return undefined;
  if (imageId === null) return null;
  const trimmed = imageId.trim();
  return trimmed === "" ? null : trimmed;
}

/** Validasi `urutan`: undefined = tidak diubah, null = kosong, selain itu bilangan bulat dalam rentang. */
export function periksaUrutan(urutan: number | null | undefined): Hasil<number | null | undefined> {
  if (urutan === undefined || urutan === null) return { ok: true, data: urutan };
  if (!Number.isInteger(urutan) || urutan < URUTAN_MIN || urutan > URUTAN_MAX) {
    return {
      ok: false,
      message: `Urutan harus bilangan bulat ${URUTAN_MIN}–${URUTAN_MAX} (dikirim ${urutan})`,
    };
  }
  return { ok: true, data: urutan };
}

/** Validasi daftar id galeri: buang kosong & duplikat, tolak bila melebihi batas. */
export function periksaImageIds(imageIds: string[]): Hasil<string[]> {
  const unik = Array.from(
    new Set(imageIds.map((id) => id.trim()).filter((id) => id !== ""))
  );
  if (unik.length > MAX_GAMBAR_DOKUMENTASI) {
    return {
      ok: false,
      message: `Maksimal ${MAX_GAMBAR_DOKUMENTASI} gambar dokumentasi (dikirim ${unik.length})`,
    };
  }
  return { ok: true, data: unik };
}

/** Susun `data` prisma.create: logo opsional, galeri di-connect bila ada, urutan hanya bila dikirim. */
export function susunDataCreate(body: ProgramInovasiCreateBody): Hasil<{
  name: string;
  description: string;
  imageId: string | null;
  urutan?: number | null;
  images?: { connect: { id: string }[] };
}> {
  const ids = periksaImageIds(body.imageIds ?? []);
  if (!ids.ok) return ids;
  const urutan = periksaUrutan(body.urutan);
  if (!urutan.ok) return urutan;
  return {
    ok: true,
    data: {
      name: body.name,
      description: body.description,
      imageId: normalisasiImageId(body.imageId) ?? null,
      ...(urutan.data !== undefined ? { urutan: urutan.data } : {}),
      ...(ids.data.length > 0
        ? { images: { connect: ids.data.map((id) => ({ id })) } }
        : {}),
    },
  };
}

/** Susun `data` prisma.update: imageId kosong → null (logo dihapus), galeri di-`set` hanya bila dikirim. */
export function susunDataUpdate(body: ProgramInovasiUpdateBody): Hasil<{
  name?: string;
  description?: string;
  imageId?: string | null;
  urutan?: number | null;
  images?: { set: { id: string }[] };
}> {
  const urutan = periksaUrutan(body.urutan);
  if (!urutan.ok) return urutan;
  let images: { set: { id: string }[] } | undefined;
  if (body.imageIds !== undefined) {
    const ids = periksaImageIds(body.imageIds);
    if (!ids.ok) return ids;
    images = { set: ids.data.map((id) => ({ id })) };
  }
  const imageId = normalisasiImageId(body.imageId);
  return {
    ok: true,
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(imageId !== undefined ? { imageId } : {}),
      ...(urutan.data !== undefined ? { urutan: urutan.data } : {}),
      ...(images ? { images } : {}),
    },
  };
}
