// Kerangka impor CSV bertabel (fungsi murni, browser + server): header beralias, kolom wajib, header ganda,
// batas ukuran/baris, validasi per baris oleh domain, dan pembuat berkas template. Aturan kolom tetap di domain.
import type { Validasi } from "@/lib/program-kemiskinan/penerima.rules";
import { bacaTabelCsv, cariKolom, hitungKolom } from "./parse-csv";

/** Baris yang ditolak beserta alasannya (tanpa isi data). */
export type BarisDitolak = { baris: number; alasan: string };
/** Hasil parsing: baris valid (+ nomor baris berkas, 1 = header), baris ditolak, dan galat berkas bila ada. */
export type HasilCsvImpor<R> = { rows: (R & { baris: number })[]; ditolak: BarisDitolak[]; galat: string | null };

export type SpekCsvImpor<K extends string, R> = {
  /** Alias header per kolom (sudah dinormalkan: huruf kecil, selain huruf/angka → spasi). */
  kolom: Record<K, readonly string[]>;
  wajib: readonly K[];
  maksBaris: number;
  maksBytes: number;
  /** Validasi satu baris; `sel` berisi teks sel mentah (undefined bila kolom tidak ada di header). */
  validasi: (sel: Record<K, string | undefined>) => Validasi<R>;
};

const gagal = <R>(galat: string): HasilCsvImpor<R> => ({ rows: [], ditolak: [], galat });
const daftar = (kolom: readonly string[]) => kolom.map((k) => `'${k}'`).join(", ");

/** Parse CSV sesuai spek; kolom yang tidak dikenal dibuang sehingga tidak pernah ikut terkirim ke server. */
export function parseCsvImpor<K extends string, R>(teks: string, spek: SpekCsvImpor<K, R>): HasilCsvImpor<R> {
  const tabel = bacaTabelCsv(teks, spek.maksBytes);
  if (tabel.galat) return gagal(tabel.galat);

  const kunci = Object.keys(spek.kolom) as K[];
  const ganda = kunci.filter((k) => hitungKolom(tabel.headers, spek.kolom[k]) > 1);
  if (ganda.length > 0) return gagal(`Header CSV memuat kolom ${daftar(ganda)} lebih dari satu kali`);

  const idx = Object.fromEntries(kunci.map((k) => [k, cariKolom(tabel.headers, spek.kolom[k])])) as Record<K, number>;
  const hilang = spek.wajib.filter((k) => idx[k] < 0);
  if (hilang.length > 0) return gagal(`Header CSV wajib memuat kolom ${daftar(hilang)}`);

  if (tabel.data.length > spek.maksBaris) {
    return gagal(`Maksimal ${spek.maksBaris} baris per impor (berkas berisi ${tabel.data.length})`);
  }

  const rows: HasilCsvImpor<R>["rows"] = [];
  const ditolak: BarisDitolak[] = [];
  for (const { baris, cells } of tabel.data) {
    const sel = Object.fromEntries(kunci.map((k) => [k, idx[k] >= 0 ? cells[idx[k]] : undefined])) as Record<K, string | undefined>;
    const v = spek.validasi(sel);
    if (v.ok) rows.push({ ...v.value, baris });
    else ditolak.push({ baris, alasan: v.alasan });
  }
  return { rows, ditolak, galat: null };
}

/** Isi berkas template: pemisah ";" agar terbuka benar di Excel lokal Indonesia, CRLF, UTF-8 dengan BOM. */
export function buatBerkasCsv(baris: readonly (readonly string[])[]): string {
  return `﻿${baris.map((b) => b.join(";")).join("\r\n")}\r\n`;
}
