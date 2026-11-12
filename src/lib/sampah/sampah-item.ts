// Bentuk item Sampah di kontrak API `/api/pengaturan/sampah` + konversi dari baris sumber. Fungsi murni.
import { resolveSampahAsal, type SampahAsal } from "./sampah-kelompok";
import { sisaHariSampah } from "./sampah-retensi";

export type SampahJenis = "file" | "dokumen";
export type SampahKategori = "image" | "document" | "audio" | "other";

/** Satu item di daftar Sampah (kontrak API — jangan ubah tanpa bump & dokumentasi). */
export type SampahItem = {
  /** "file:<fileId>" atau "<sumber>:<id>" (mis. "dak:abc"). */
  id: string;
  jenis: SampahJenis;
  judul: string;
  mimeType: string;
  kategori: SampahKategori;
  ukuran: number | null;
  pratinjauUrl: string | null;
  /** ISO 8601. */
  dihapusPada: string;
  sisaHari: number;
  asal: SampahAsal;
};

/** Baris netral dari satu sumber Sampah sebelum dibentuk jadi `SampahItem`. */
export type SampahRow = {
  /** Kunci sumber, mis. "file", "dak". */
  sumber: string;
  id: string;
  jenis: SampahJenis;
  judul: string;
  deletedAt: Date;
  menuId: string | null;
  file: { mimeType: string; category: string; size: number | null } | null;
};

const KATEGORI: readonly SampahKategori[] = ["image", "document", "audio", "other"];

/** `FileStorage.category` → kategori kontrak; nilai lain/kosong → "other". */
export function toSampahKategori(category: string | null | undefined): SampahKategori {
  return KATEGORI.find((k) => k === category) ?? "other";
}

/** ID item gabungan "<sumber>:<id>". */
export function formatSampahId(sumber: string, id: string): string {
  return `${sumber}:${id}`;
}

/** Pecah ID item; null bila format tidak valid (tanpa ":" atau bagian kosong). */
export function parseSampahId(raw: string): { sumber: string; id: string } | null {
  const i = raw.indexOf(":");
  if (i <= 0 || i === raw.length - 1) return null;
  return { sumber: raw.slice(0, i), id: raw.slice(i + 1) };
}

/** URL pratinjau khusus admin (dijaga guard Sampah); item tanpa berkas → null. */
export function sampahPratinjauUrl(itemId: string, hasFile: boolean): string | null {
  return hasFile ? `/api/pengaturan/sampah/${encodeURIComponent(itemId)}/pratinjau` : null;
}

/** Bentuk item respons dari baris sumber; `retensiHari` per sumber (DAK bisa ditimpa env). */
export function toSampahItem(row: SampahRow, now: Date, retensiHari: number): SampahItem {
  const id = formatSampahId(row.sumber, row.id);
  return {
    id,
    jenis: row.jenis,
    judul: row.judul,
    mimeType: row.file?.mimeType ?? "",
    kategori: row.file ? toSampahKategori(row.file.category) : "document",
    ukuran: row.file?.size ?? null,
    pratinjauUrl: sampahPratinjauUrl(id, row.file !== null),
    dihapusPada: row.deletedAt.toISOString(),
    sisaHari: sisaHariSampah(row.deletedAt, now, retensiHari),
    asal: resolveSampahAsal(row.menuId),
  };
}

/** Gabung baris beberapa sumber: terbaru dihapus dulu, seri diurutkan ID agar paging stabil. */
export function compareSampahRows(a: SampahRow, b: SampahRow): number {
  const diff = b.deletedAt.getTime() - a.deletedAt.getTime();
  if (diff !== 0) return diff;
  return formatSampahId(a.sumber, a.id) < formatSampahId(b.sumber, b.id) ? -1 : 1;
}
