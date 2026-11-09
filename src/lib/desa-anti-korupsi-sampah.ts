// Aturan tempat sampah dokumen Desa Anti Korupsi — fungsi & konstanta murni tanpa I/O.
// Dokumen terhapus (soft delete: isActive=false + deletedAt) disimpan sekian hari, lalu dihapus
// permanen secara "lazy" saat daftar sampah dibuka (repo tidak punya cron).
import { DOKUMEN_MAX_PER_PROGRAM } from "./desa-anti-korupsi-dokumen";

/** Lama dokumen terhapus disimpan di tempat sampah sebelum dihapus permanen (hari). */
export const DAK_SAMPAH_RETENSI_HARI = 30;
/** Batas baris daftar sampah per program yang dikirim (terbaru dulu); sisanya tetap dibersihkan sesuai retensi. */
export const DAK_SAMPAH_MAX_DAFTAR = 200;

const MS_PER_HARI = 24 * 60 * 60 * 1000;

type Fail = { ok: false; message: string };

/** Retensi dari env `DAK_SAMPAH_RETENSI_HARI` (bilangan bulat ≥ 1); kosong/tidak valid → 30. */
export function resolveRetensiHari(raw: string | undefined): number {
  const n = Number(raw);
  return raw !== undefined && raw.trim() !== "" && Number.isInteger(n) && n >= 1 ? n : DAK_SAMPAH_RETENSI_HARI;
}

/** Batas waktu: dokumen dengan `deletedAt <= cutoff` sudah melewati retensi (tepat N hari ikut kedaluwarsa). */
export function sampahCutoff(now: Date, retensiHari: number): Date {
  return new Date(now.getTime() - retensiHari * MS_PER_HARI);
}

/** Apakah dokumen terhapus sudah melewati retensi sehingga harus dihapus permanen. */
export function isSampahKedaluwarsa(deletedAt: Date, now: Date, retensiHari: number): boolean {
  return deletedAt.getTime() <= sampahCutoff(now, retensiHari).getTime();
}

/** Sisa hari sebelum dihapus permanen, dibulatkan ke atas (baru dihapus = N, tepat N hari = 0). */
export function sisaHariSampah(deletedAt: Date, now: Date, retensiHari: number): number {
  const sisaMs = deletedAt.getTime() + retensiHari * MS_PER_HARI - now.getTime();
  return Math.min(retensiHari, Math.max(0, Math.ceil(sisaMs / MS_PER_HARI)));
}

/** Filter Prisma baris sampah program yang kedaluwarsa (dipakai `deleteMany` sebelum daftar dibaca). */
export function sampahPurgeWhere(programId: string, now: Date, retensiHari: number) {
  return {
    desaAntiKorupsiId: programId,
    isActive: false,
    deletedAt: { lte: sampahCutoff(now, retensiHari) },
  };
}

/** Baris sampah dari DB (select handler) sebelum dibentuk menjadi item respons. */
export type SampahRow = {
  id: string;
  judul: string;
  folderId: string | null;
  folder: { nama: string } | null;
  file: { id: string; link: string; realName: string; mimeType: string };
  deletedAt: Date | null;
};

/** Satu item daftar sampah di respons API. */
export type SampahItem = Omit<SampahRow, "folder" | "deletedAt"> & {
  folderNama: string | null;
  deletedAt: Date;
  sisaHari: number;
};

/** Bentuk item respons; baris tanpa `deletedAt` atau yang sudah kedaluwarsa dibuang. */
export function toSampahItems(rows: SampahRow[], now: Date, retensiHari: number): SampahItem[] {
  return rows.flatMap(({ folder, deletedAt, ...rest }) => {
    if (!deletedAt || isSampahKedaluwarsa(deletedAt, now, retensiHari)) return [];
    return [{ ...rest, folderNama: folder?.nama ?? null, deletedAt, sisaHari: sisaHariSampah(deletedAt, now, retensiHari) }];
  });
}

/** Dokumen aktif ringkas (folder + berkas + urutan), bahan cek duplikat & urutan akhir folder. */
export type DokumenAktifRingkas = { folderId: string | null; fileId: string; urutan: number };

/** Urutan berikutnya di akhir folder (`null` = "Umum"): urutan terbesar + 1, folder kosong → 0. */
export function urutanAkhirFolder(aktif: readonly DokumenAktifRingkas[], folderId: string | null): number {
  const urutan = aktif.filter((d) => d.folderId === folderId).map((d) => d.urutan);
  return urutan.length === 0 ? 0 : Math.max(...urutan) + 1;
}

/**
 * Dokumen di sampah yang akan dipulihkan; `folderAktif` = folder asalnya masih ada & aktif,
 * `fileAktif` = berkas FileStorage-nya belum dihapus.
 */
export type DokumenSampah = { fileId: string; folderId: string | null; folderAktif: boolean; fileAktif: boolean };

export type PulihkanPlan = { ok: true; folderId: string | null; urutan: number } | Fail;

/**
 * Tentukan tujuan pemulihan: folder asal bila masih aktif, selain itu "Umum". Berkas yang sudah dihapus,
 * tujuan yang sudah berisi dokumen aktif dengan berkas sama, atau program yang penuh ditolak (handler → 409).
 */
export function planPulihkan(dokumen: DokumenSampah, aktifProgram: readonly DokumenAktifRingkas[]): PulihkanPlan {
  if (!dokumen.fileAktif) return { ok: false, message: "Berkas dokumen sudah dihapus sehingga tidak bisa dipulihkan" };
  const folderId = dokumen.folderId !== null && dokumen.folderAktif ? dokumen.folderId : null;
  if (aktifProgram.some((d) => d.folderId === folderId && d.fileId === dokumen.fileId)) {
    const tujuan = folderId === null ? "folder Umum" : "folder asal";
    return { ok: false, message: `Berkas yang sama sudah ada di ${tujuan}; hapus atau pindahkan dokumen itu dulu` };
  }
  if (aktifProgram.length >= DOKUMEN_MAX_PER_PROGRAM) {
    return { ok: false, message: `Program sudah berisi ${DOKUMEN_MAX_PER_PROGRAM} dokumen (batas maksimal)` };
  }
  return { ok: true, folderId, urutan: urutanAkhirFolder(aktifProgram, folderId) };
}
