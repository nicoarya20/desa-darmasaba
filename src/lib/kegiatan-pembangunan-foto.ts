/**
 * Dokumentasi foto Kegiatan Desa kategori Pembangunan (foto sebelum, foto sesudah, galeri progres) —
 * fungsi murni tanpa DB, dipakai handler create/update, form admin, dan halaman publik supaya batas,
 * pesan error, dan susunan tampil satu sumber.
 */
import type { Prisma } from "@prisma/client";
import { PENGUMUMAN_FILE_SELECT, type PengumumanFile } from "./pengumuman-lampiran";
import { KATEGORI_PEMBANGUNAN_ID } from "./kegiatan-pembangunan";

/** Batas foto galeri progres per kegiatan. */
export const MAX_FOTO_PROGRES = 10;
/** Mime yang diterima (endpoint upload mengonversi gambar ke WebP; jenis lain disimpan ter-gzip). */
export const FOTO_PEMBANGUNAN_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

/** Berkas foto dalam respons API (bentuk sama dengan lampiran Pengumuman). */
export type FotoPembangunanFile = PengumumanFile;

/** Include foto di detail kegiatan; galeri terurut `urutan asc`. */
export const FOTO_PEMBANGUNAN_INCLUDE = {
  fotoSebelum: { select: PENGUMUMAN_FILE_SELECT },
  fotoSesudah: { select: PENGUMUMAN_FILE_SELECT },
  fotoProgres: {
    orderBy: { urutan: "asc" },
    select: { fileId: true, file: { select: PENGUMUMAN_FILE_SELECT } },
  },
} satisfies Prisma.KegiatanDesaInclude;

/** Select ringan untuk mengambil rujukan berkas sebelum update (pembersihan berkas yang dilepas). */
export const FOTO_PEMBANGUNAN_REF_SELECT = {
  fotoSebelumId: true,
  fotoSesudahId: true,
  fotoProgres: { select: { fileId: true } },
} satisfies Prisma.KegiatanDesaSelect;

/** Foto yang sudah dinormalisasi; field undefined = tidak dikirim (tidak diubah). */
export type FotoPembangunanInput = {
  /** undefined = tidak diubah; null = hapus; string = id FileStorage. */
  fotoSebelumId?: string | null;
  fotoSesudahId?: string | null;
  /** undefined = tidak diubah; array = set final, urutan = urutan tampil. */
  fotoProgresIds?: string[];
};

export type FotoPembangunanParseResult =
  | { ok: true; data: FotoPembangunanInput }
  | { ok: false; message: string };

const LABEL_SEBELUM = "Foto sebelum";
const LABEL_SESUDAH = "Foto sesudah";
const LABEL_PROGRES = "Foto progres";

function parseIdTunggal(value: unknown, label: string): { ok: true; data: string | null | undefined } | { ok: false; message: string } {
  if (value === undefined) return { ok: true, data: undefined };
  if (value === null) return { ok: true, data: null };
  if (typeof value !== "string") return { ok: false, message: `${label} tidak valid` };
  const trimmed = value.trim();
  return { ok: true, data: trimmed === "" ? null : trimmed };
}

/**
 * Validasi & normalisasi field foto dari body request.
 * undefined → dilewati (tidak diubah); null/"" → dihapus; string → id. Galeri: array id tanpa duplikat, maks 10.
 */
export function parseFotoPembangunanInput(body: Record<string, unknown>): FotoPembangunanParseResult {
  const data: FotoPembangunanInput = {};

  const sebelum = parseIdTunggal(body.fotoSebelumId, LABEL_SEBELUM);
  if (!sebelum.ok) return sebelum;
  if (sebelum.data !== undefined) data.fotoSebelumId = sebelum.data;

  const sesudah = parseIdTunggal(body.fotoSesudahId, LABEL_SESUDAH);
  if (!sesudah.ok) return sesudah;
  if (sesudah.data !== undefined) data.fotoSesudahId = sesudah.data;

  const progres = body.fotoProgresIds;
  if (progres !== undefined) {
    if (!Array.isArray(progres) || progres.some((id) => typeof id !== "string" || id.trim() === "")) {
      return { ok: false, message: "Galeri foto progres tidak valid" };
    }
    const ids = (progres as string[]).map((id) => id.trim());
    if (new Set(ids).size !== ids.length) {
      return { ok: false, message: "Galeri foto progres tidak boleh berisi foto yang sama lebih dari sekali" };
    }
    if (ids.length > MAX_FOTO_PROGRES) {
      return { ok: false, message: `Maksimal ${MAX_FOTO_PROGRES} foto progres per kegiatan (dikirim ${ids.length})` };
    }
    data.fotoProgresIds = ids;
  }

  return { ok: true, data };
}

/**
 * Foto yang boleh disimpan untuk sebuah kategori: kategori selain Pembangunan selalu dikosongkan
 * (foto ini khusus Pembangunan, sama dengan `resolvePembangunanData`).
 */
export function resolveFotoPembangunan(
  kategoriKegiatanId: string,
  input: FotoPembangunanInput,
): FotoPembangunanInput {
  if (kategoriKegiatanId === KATEGORI_PEMBANGUNAN_ID) return input;
  return { fotoSebelumId: null, fotoSesudahId: null, fotoProgresIds: [] };
}

/** True bila ada field foto yang dikirim (sehingga berkas lama mungkin dilepas). */
export function adaPerubahanFoto(input: FotoPembangunanInput): boolean {
  return (
    input.fotoSebelumId !== undefined ||
    input.fotoSesudahId !== undefined ||
    input.fotoProgresIds !== undefined
  );
}

/** Berkas yang dirujuk input beserta label pesan error-nya (id unik per peran). */
export function rujukanFoto(input: FotoPembangunanInput): { id: string; label: string }[] {
  return [
    ...(input.fotoSebelumId ? [{ id: input.fotoSebelumId, label: LABEL_SEBELUM }] : []),
    ...(input.fotoSesudahId ? [{ id: input.fotoSesudahId, label: LABEL_SESUDAH }] : []),
    ...(input.fotoProgresIds ?? []).map((id) => ({ id, label: LABEL_PROGRES })),
  ];
}

/**
 * Cocokkan rujukan dengan baris FileStorage aktif: semua harus ada dan bermime JPG/PNG/WebP.
 * `rows` = hasil satu query `findMany({ id: { in }, isActive: true })`.
 */
export function periksaFotoPembangunan(
  rujukan: { id: string; label: string }[],
  rows: { id: string; mimeType: string }[],
): { ok: true } | { ok: false; message: string } {
  const mime = new Map(rows.map((r) => [r.id, r.mimeType]));
  for (const { id, label } of rujukan) {
    const tipe = mime.get(id);
    if (tipe === undefined) return { ok: false, message: `${label} tidak ditemukan atau sudah dihapus` };
    if (!(FOTO_PEMBANGUNAN_MIME as readonly string[]).includes(tipe)) {
      return { ok: false, message: `${label} harus berformat JPG, PNG, atau WebP` };
    }
  }
  return { ok: true };
}

/** Kolom scalar foto untuk `kegiatanDesa.update`: hanya field yang dikirim (galeri ditangani terpisah). */
export function susunDataFotoUpdate(input: FotoPembangunanInput): {
  fotoSebelumId?: string | null;
  fotoSesudahId?: string | null;
} {
  return {
    ...(input.fotoSebelumId !== undefined ? { fotoSebelumId: input.fotoSebelumId } : {}),
    ...(input.fotoSesudahId !== undefined ? { fotoSesudahId: input.fotoSesudahId } : {}),
  };
}

/** Data foto untuk `kegiatanDesa.create`: scalar + galeri nested (urutan = indeks). */
export function susunDataFotoCreate(input: FotoPembangunanInput): {
  fotoSebelumId: string | null;
  fotoSesudahId: string | null;
  fotoProgres?: { create: { fileId: string; urutan: number }[] };
} {
  const ids = input.fotoProgresIds ?? [];
  return {
    fotoSebelumId: input.fotoSebelumId ?? null,
    fotoSesudahId: input.fotoSesudahId ?? null,
    ...(ids.length > 0 ? { fotoProgres: { create: ids.map((fileId, urutan) => ({ fileId, urutan })) } } : {}),
  };
}

/** Baris galeri untuk `kegiatanDesaFoto.createMany` (urutan = indeks). */
export function susunBarisGaleri(kegiatanDesaId: string, ids: string[]): { kegiatanDesaId: string; fileId: string; urutan: number }[] {
  return ids.map((fileId, urutan) => ({ kegiatanDesaId, fileId, urutan }));
}

type FotoRecord = {
  fotoSebelumId?: string | null;
  fotoSesudahId?: string | null;
  fotoProgres?: { fileId: string }[] | null;
};

/** Semua id berkas yang dirujuk record foto (untuk `removeReleasedFiles`). */
export function idBerkasFoto(record: FotoRecord | null | undefined): string[] {
  if (!record) return [];
  return [
    ...(record.fotoSebelumId ? [record.fotoSebelumId] : []),
    ...(record.fotoSesudahId ? [record.fotoSesudahId] : []),
    ...(record.fotoProgres ?? []).map((f) => f.fileId),
  ];
}

/** Ratakan baris galeri `{ file }` hasil query menjadi daftar berkas (untuk respons API). */
export function ratakanFotoProgres(
  rows: { file: FotoPembangunanFile }[] | null | undefined,
): FotoPembangunanFile[] {
  return (rows ?? []).map((r) => r.file);
}

/** Bentuk respons API foto: `fotoProgres` jadi `File[]` terurut. */
export function bentukFotoRespons<T extends { fotoProgres?: { file: FotoPembangunanFile }[] | null }>(
  record: T,
): Omit<T, "fotoProgres"> & { fotoProgres: FotoPembangunanFile[] } {
  return { ...record, fotoProgres: ratakanFotoProgres(record.fotoProgres) };
}

/** Foto publik minimal yang dibutuhkan tampilan. */
export type FotoPublik = { id: string; link: string; realName?: string | null };

export type SusunanFotoPublik = {
  /** Pasangan sebelum/sesudah yang ada (satu saja bila hanya satu; urutan: sebelum lalu sesudah). */
  pasangan: { kunci: "sebelum" | "sesudah"; file: FotoPublik }[];
  galeri: FotoPublik[];
  adaFoto: boolean;
};

/** Susunan blok "Dokumentasi Pembangunan" publik; tolerant terhadap field hilang/null (API lama). */
export function susunanFotoPublik(data: {
  fotoSebelum?: FotoPublik | null;
  fotoSesudah?: FotoPublik | null;
  fotoProgres?: FotoPublik[] | null;
}): SusunanFotoPublik {
  const pasangan: SusunanFotoPublik["pasangan"] = [
    ...(data.fotoSebelum?.link ? [{ kunci: "sebelum" as const, file: data.fotoSebelum }] : []),
    ...(data.fotoSesudah?.link ? [{ kunci: "sesudah" as const, file: data.fotoSesudah }] : []),
  ];
  const galeri = (data.fotoProgres ?? []).filter((f) => !!f?.link);
  return { pasangan, galeri, adaFoto: pasangan.length > 0 || galeri.length > 0 };
}

/** Sisa slot galeri progres di form admin (tidak pernah negatif). */
export function sisaSlotFotoProgres(jumlah: number): number {
  return Math.max(0, MAX_FOTO_PROGRES - jumlah);
}
