// Kontrak item Sampah per fitur koleksi (`/api/sampah/:sumber`) + konversi dari baris sumber. Fungsi murni, dipakai
// backend dan panel Sampah tiap fitur. Kontrak: docs/decisions/2026-11-12-sampah.md.
import { sisaHariSampah } from "./sampah-retensi";

/** Sumber Sampah yang dilayani `/api/sampah/:sumber` (DAK memakai endpoint panel sampah DAK sendiri). */
export const SAMPAH_SUMBER = ["dokumen-apbdes", "foto-bumdes", "dokumen-perencanaan"] as const;
export type SampahSumber = (typeof SAMPAH_SUMBER)[number];

export type SampahKategori = "image" | "document" | "audio" | "other";

/** Satu item di daftar Sampah sebuah fitur (kontrak API — jangan ubah tanpa bump & dokumentasi). */
export type SampahItem = {
  /** ID baris entitas (dokumen/foto). */
  id: string;
  judul: string;
  mimeType: string;
  kategori: SampahKategori;
  ukuran: number | null;
  /** Link berkas entitas (berkas entitas di Sampah tetap aktif); null bila tanpa berkas. */
  pratinjauUrl: string | null;
  /** ISO 8601. */
  dihapusPada: string;
  sisaHari: number;
  /** Folder asal (mis. dokumen APBDes) bila ada. */
  folderNama: string | null;
};

/** Data respons `GET /api/sampah/:sumber`. */
export type SampahListData = { items: SampahItem[]; total: number; page: number; limit: number; retensiHari: number };

/** Baris netral dari satu sumber Sampah sebelum dibentuk jadi `SampahItem`. */
export type SampahRow = {
  id: string;
  judul: string;
  deletedAt: Date;
  folderNama: string | null;
  file: { mimeType: string; category: string; size: number | null; link: string } | null;
};

const KATEGORI: readonly SampahKategori[] = ["image", "document", "audio", "other"];

/** True bila `raw` adalah sumber Sampah yang dikenal. */
export function isSampahSumber(raw: string): raw is SampahSumber {
  return (SAMPAH_SUMBER as readonly string[]).includes(raw);
}

/** `FileStorage.category` → kategori kontrak; nilai lain/kosong → "other". */
export function toSampahKategori(category: string | null | undefined): SampahKategori {
  return KATEGORI.find((k) => k === category) ?? "other";
}

/** Bentuk item respons dari baris sumber; `retensiHari` per sumber. */
export function toSampahItem(row: SampahRow, now: Date, retensiHari: number): SampahItem {
  return {
    id: row.id,
    judul: row.judul,
    mimeType: row.file?.mimeType ?? "",
    kategori: row.file ? toSampahKategori(row.file.category) : "document",
    ukuran: row.file?.size ?? null,
    pratinjauUrl: row.file?.link || null,
    dihapusPada: row.deletedAt.toISOString(),
    sisaHari: sisaHariSampah(row.deletedAt, now, retensiHari),
    folderNama: row.folderNama,
  };
}
