/**
 * Logika murni body API Program Inovasi (tanpa DB) — dipakai handler create/update
 * dan form admin, supaya aturan logo opsional & batas galeri dokumentasi satu sumber.
 */

/** Batas jumlah gambar galeri dokumentasi per program (dicek di API dan form admin). */
export const MAX_GAMBAR_DOKUMENTASI = 20;

/** Body create sesuai skema Elysia (link sudah tidak diterima dari form). */
export type ProgramInovasiCreateBody = {
  name: string;
  description: string;
  imageId?: string | null;
  imageIds?: string[];
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

/** Susun `data` prisma.create: logo opsional, galeri di-connect bila ada. */
export function susunDataCreate(body: ProgramInovasiCreateBody): Hasil<{
  name: string;
  description: string;
  imageId: string | null;
  images?: { connect: { id: string }[] };
}> {
  const ids = periksaImageIds(body.imageIds ?? []);
  if (!ids.ok) return ids;
  return {
    ok: true,
    data: {
      name: body.name,
      description: body.description,
      imageId: normalisasiImageId(body.imageId) ?? null,
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
  images?: { set: { id: string }[] };
}> {
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
      ...(images ? { images } : {}),
    },
  };
}
