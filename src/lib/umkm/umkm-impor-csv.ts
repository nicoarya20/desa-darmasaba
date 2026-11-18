// Parser CSV impor Data UMKM — fungsi murni (jalan di browser untuk pratinjau). Hanya kolom yang dikenal yang
// diambil; kolom lain (mis. gambar, status) dibuang saat parsing sehingga tidak pernah ikut terkirim ke server.
import { bacaTabelCsv, cariKolom, hitungKolom } from "@/lib/csv/parse-csv";
import {
  IMPOR_UMKM_MAKS_BARIS,
  IMPOR_UMKM_MAKS_BYTES,
  validasiBarisUmkm,
  type UmkmImporInput,
} from "./umkm-impor.rules";

/** Satu baris valid dari CSV beserta nomor barisnya di berkas (1 = header). */
export type BarisUmkm = UmkmImporInput & { baris: number };
/** Baris yang ditolak beserta alasannya (tanpa isi data). */
export type BarisUmkmDitolak = { baris: number; alasan: string };
/** Hasil parsing: baris valid, baris ditolak, dan galat berkas (header/ukuran/jumlah baris) bila ada. */
export type HasilCsvUmkm = { rows: BarisUmkm[]; ditolak: BarisUmkmDitolak[]; galat: string | null };

// Alias header sudah dinormalkan (huruf kecil, selain huruf/angka → spasi): "No. HP" → "no hp".
const KOLOM = {
  nama: ["nama", "nama umkm", "nama usaha"],
  pemilik: ["pemilik", "nama pemilik"],
  kategori: ["kategori", "kategori produk", "kategori umkm"],
  deskripsi: ["deskripsi"],
  alamat: ["alamat"],
  kontak: ["kontak", "telepon", "no hp", "no telepon", "whatsapp"],
} as const;
type NamaKolom = keyof typeof KOLOM;
const WAJIB: NamaKolom[] = ["nama", "pemilik", "kategori"];

const gagal = (galat: string): HasilCsvUmkm => ({ rows: [], ditolak: [], galat });

/**
 * Parse CSV UMKM: baris pertama header (wajib memuat `nama`, `pemilik`, `kategori`; opsional `deskripsi`,
 * `alamat`, `kontak`; alias umum diterima), baris kosong dilewati, baris tak valid ditolak.
 */
export function parseCsvUmkm(teks: string): HasilCsvUmkm {
  const tabel = bacaTabelCsv(teks, IMPOR_UMKM_MAKS_BYTES);
  if (tabel.galat) return gagal(tabel.galat);

  const ganda = (Object.keys(KOLOM) as NamaKolom[]).filter((k) => hitungKolom(tabel.headers, KOLOM[k]) > 1);
  if (ganda.length > 0) return gagal(`Header CSV memuat kolom ${ganda.map((k) => `'${k}'`).join(", ")} lebih dari satu kali`);

  const idx = Object.fromEntries((Object.keys(KOLOM) as NamaKolom[]).map((k) => [k, cariKolom(tabel.headers, [...KOLOM[k]])])) as Record<NamaKolom, number>;
  const hilang = WAJIB.filter((k) => idx[k] < 0);
  if (hilang.length > 0) return gagal(`Header CSV wajib memuat kolom ${hilang.map((k) => `'${k}'`).join(", ")}`);

  if (tabel.data.length > IMPOR_UMKM_MAKS_BARIS) {
    return gagal(`Maksimal ${IMPOR_UMKM_MAKS_BARIS} baris per impor (berkas berisi ${tabel.data.length})`);
  }

  const rows: BarisUmkm[] = [];
  const ditolak: BarisUmkmDitolak[] = [];
  for (const { baris, cells } of tabel.data) {
    const sel = (k: NamaKolom) => (idx[k] >= 0 ? cells[idx[k]] : undefined);
    const v = validasiBarisUmkm({
      nama: sel("nama"),
      pemilik: sel("pemilik"),
      kategori: sel("kategori"),
      deskripsi: sel("deskripsi"),
      alamat: sel("alamat"),
      kontak: sel("kontak"),
    });
    if (v.ok) rows.push({ ...v.value, baris });
    else ditolak.push({ baris, alasan: v.alasan });
  }
  return { rows, ditolak, galat: null };
}

/** Isi template CSV: pemisah ";" agar terbuka benar di Excel lokal Indonesia, UTF-8 dengan BOM, 2 baris contoh rekaan. */
export function buatTemplateCsvUmkm(): string {
  const baris = [
    ["nama", "pemilik", "kategori", "deskripsi", "alamat", "kontak"],
    ["Warung Sate Bu Komang", "Ni Komang Ayu", "Makanan", "Sate dan lawar khas Bali", "Br. Dinas Contoh, Darmasaba", "081234567890"],
    ["Kerajinan Bambu Pak Wayan", "I Wayan Contoh", "Kerajinan", "", "Br. Dinas Contoh 2, Darmasaba", ""],
  ];
  return `﻿${baris.map((b) => b.join(";")).join("\r\n")}\r\n`;
}
