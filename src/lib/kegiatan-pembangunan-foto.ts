/**
 * Dokumentasi foto Kegiatan Desa kategori Pembangunan (foto sebelum & foto sesudah, maks 5 per jenis) —
 * fungsi murni tanpa DB, dipakai handler create/update, form admin, dan halaman publik supaya batas,
 * pesan error, dan susunan tampil satu sumber.
 */
import type { Prisma } from "@prisma/client";
import { PENGUMUMAN_FILE_SELECT, type PengumumanFile } from "./pengumuman-lampiran";
import { KATEGORI_PEMBANGUNAN_ID } from "./kegiatan-pembangunan";

/** Batas foto per jenis (sebelum / sesudah) per kegiatan. */
export const MAX_FOTO_PER_JENIS = 5;
/** Mime yang diterima (endpoint upload mengonversi gambar ke WebP; jenis lain disimpan ter-gzip). */
export const FOTO_PEMBANGUNAN_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

/** Nilai kolom `KegiatanDesaFoto.jenis` (String di DB, divalidasi di sini). */
export const JENIS_FOTO = ["sebelum", "sesudah"] as const;
export type JenisFoto = (typeof JENIS_FOTO)[number];

/** Berkas foto dalam respons API (bentuk sama dengan lampiran Pengumuman). */
export type FotoPembangunanFile = PengumumanFile;

/** Include foto di detail kegiatan; baris terurut (jenis, urutan asc) dan dipecah per jenis oleh `bentukFotoRespons`. */
export const FOTO_PEMBANGUNAN_INCLUDE = {
  foto: {
    orderBy: [{ jenis: "asc" }, { urutan: "asc" }],
    select: { jenis: true, fileId: true, file: { select: PENGUMUMAN_FILE_SELECT } },
  },
} satisfies Prisma.KegiatanDesaInclude;

/** Select ringan untuk mengambil rujukan berkas sebelum update (jenis yang ada + pembersihan berkas yang dilepas). */
export const FOTO_PEMBANGUNAN_REF_SELECT = {
  foto: { select: { jenis: true, fileId: true } },
} satisfies Prisma.KegiatanDesaSelect;

/** Foto yang sudah dinormalisasi; field undefined = tidak dikirim (tidak diubah). Array = set final, urutan = urutan tampil. */
export type FotoPembangunanInput = {
  fotoSebelumIds?: string[];
  fotoSesudahIds?: string[];
};

export type FotoPembangunanParseResult =
  | { ok: true; data: FotoPembangunanInput }
  | { ok: false; message: string };

const FIELD: Record<JenisFoto, "fotoSebelumIds" | "fotoSesudahIds"> = {
  sebelum: "fotoSebelumIds",
  sesudah: "fotoSesudahIds",
};
const LABEL: Record<JenisFoto, string> = { sebelum: "Foto sebelum", sesudah: "Foto sesudah" };

function parseKelompok(
  value: unknown,
  jenis: JenisFoto,
): { ok: true; data: string[] | undefined } | { ok: false; message: string } {
  if (value === undefined) return { ok: true, data: undefined };
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string" || id.trim() === "")) {
    return { ok: false, message: `${LABEL[jenis]} tidak valid` };
  }
  const ids = (value as string[]).map((id) => id.trim());
  if (new Set(ids).size !== ids.length) {
    return { ok: false, message: `${LABEL[jenis]} tidak boleh berisi foto yang sama lebih dari sekali` };
  }
  if (ids.length > MAX_FOTO_PER_JENIS) {
    return {
      ok: false,
      message: `Maksimal ${MAX_FOTO_PER_JENIS} ${LABEL[jenis].toLowerCase()} per kegiatan (dikirim ${ids.length})`,
    };
  }
  return { ok: true, data: ids };
}

/**
 * Validasi & normalisasi field foto dari body request.
 * undefined → dilewati (tidak diubah); array → set final (maks 5 per jenis, tanpa duplikat, tanpa id yang sama
 * di kedua kelompok bila keduanya dikirim).
 */
export function parseFotoPembangunanInput(body: Record<string, unknown>): FotoPembangunanParseResult {
  const data: FotoPembangunanInput = {};
  for (const jenis of JENIS_FOTO) {
    const hasil = parseKelompok(body[FIELD[jenis]], jenis);
    if (!hasil.ok) return hasil;
    if (hasil.data !== undefined) data[FIELD[jenis]] = hasil.data;
  }
  if (data.fotoSebelumIds && data.fotoSesudahIds) {
    const sesudah = new Set(data.fotoSesudahIds);
    if (data.fotoSebelumIds.some((id) => sesudah.has(id))) {
      return { ok: false, message: "Foto yang sama tidak boleh dipakai di foto sebelum dan foto sesudah" };
    }
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
  return { fotoSebelumIds: [], fotoSesudahIds: [] };
}

/** Jenis yang dikirim (kelompok yang akan ditulis ulang). */
export function jenisDikirim(input: FotoPembangunanInput): JenisFoto[] {
  return JENIS_FOTO.filter((jenis) => input[FIELD[jenis]] !== undefined);
}

/** True bila ada field foto yang dikirim (sehingga berkas lama mungkin dilepas). */
export function adaPerubahanFoto(input: FotoPembangunanInput): boolean {
  return jenisDikirim(input).length > 0;
}

/** Berkas yang dirujuk input beserta label pesan error-nya. */
export function rujukanFoto(input: FotoPembangunanInput): { id: string; label: string }[] {
  return JENIS_FOTO.flatMap((jenis) => (input[FIELD[jenis]] ?? []).map((id) => ({ id, label: LABEL[jenis] })));
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

type BarisFoto = { fileId: string; jenis: JenisFoto; urutan: number };

/** Baris foto untuk kelompok yang dikirim (urutan = indeks per jenis). */
function barisFoto(input: FotoPembangunanInput): BarisFoto[] {
  return jenisDikirim(input).flatMap((jenis) =>
    (input[FIELD[jenis]] ?? []).map((fileId, urutan) => ({ fileId, jenis, urutan })),
  );
}

/** Baris `KegiatanDesaFoto` siap `createMany` untuk kegiatan yang sudah ada. */
export function susunBarisFoto(
  kegiatanDesaId: string,
  input: FotoPembangunanInput,
): (BarisFoto & { kegiatanDesaId: string })[] {
  return barisFoto(input).map((baris) => ({ kegiatanDesaId, ...baris }));
}

/** Data foto untuk `kegiatanDesa.create`: baris nested (kosong = tanpa relasi). */
export function susunDataFotoCreate(input: FotoPembangunanInput): { foto?: { create: BarisFoto[] } } {
  const rows = barisFoto(input);
  return rows.length > 0 ? { foto: { create: rows } } : {};
}

type RecordFoto = { foto?: { fileId: string }[] | null };

/** Semua id berkas yang dirujuk record foto (untuk `removeReleasedFiles`). */
export function idBerkasFoto(record: RecordFoto | null | undefined): string[] {
  return (record?.foto ?? []).map((f) => f.fileId);
}

/** Apakah record punya foto untuk salah satu jenis di `jenis` (menentukan perlu menulis ulang atau tidak). */
export function adaFotoLama(
  record: { foto?: { jenis: string }[] | null } | null | undefined,
  jenis: JenisFoto[],
): boolean {
  return (record?.foto ?? []).some((f) => (jenis as string[]).includes(f.jenis));
}

type BarisFotoRespons = { jenis: string; file: FotoPembangunanFile };

/** Bentuk respons API foto: `foto` dipecah jadi `fotoSebelum` / `fotoSesudah` (File[] terurut). */
export function bentukFotoRespons<T extends { foto?: BarisFotoRespons[] | null }>(
  record: T,
): Omit<T, "foto"> & { fotoSebelum: FotoPembangunanFile[]; fotoSesudah: FotoPembangunanFile[] } {
  const { foto, ...sisa } = record;
  const rows = foto ?? [];
  const per = (jenis: JenisFoto) => rows.filter((r) => r.jenis === jenis).map((r) => r.file);
  return { ...sisa, fotoSebelum: per("sebelum"), fotoSesudah: per("sesudah") };
}

/** Foto publik minimal yang dibutuhkan tampilan. */
export type FotoPublik = { id: string; link: string; realName?: string | null };

export type SusunanFotoPublik = {
  /** Kelompok yang punya foto (sebelum lalu sesudah); kelompok kosong tidak ada. */
  kelompok: { kunci: JenisFoto; files: FotoPublik[] }[];
  adaFoto: boolean;
};

/** Susunan blok "Dokumentasi Pembangunan" publik; tolerant terhadap field hilang/null (API lama). */
export function susunanFotoPublik(data: {
  fotoSebelum?: FotoPublik[] | null;
  fotoSesudah?: FotoPublik[] | null;
}): SusunanFotoPublik {
  const per = (kunci: JenisFoto, files: FotoPublik[] | null | undefined) => ({
    kunci,
    files: (files ?? []).filter((f) => !!f?.link),
  });
  const kelompok = [per("sebelum", data.fotoSebelum), per("sesudah", data.fotoSesudah)].filter(
    (k) => k.files.length > 0,
  );
  return { kelompok, adaFoto: kelompok.length > 0 };
}
