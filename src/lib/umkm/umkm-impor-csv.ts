// Parser CSV impor Data UMKM — fungsi murni (jalan di browser untuk pratinjau). Hanya kolom yang dikenal yang
// diambil; kolom lain (mis. gambar, status) dibuang saat parsing sehingga tidak pernah ikut terkirim ke server.
import { buatBerkasCsv, parseCsvImpor, type BarisDitolak, type HasilCsvImpor } from "@/lib/csv/parse-impor";
import {
  IMPOR_UMKM_MAKS_BARIS,
  IMPOR_UMKM_MAKS_BYTES,
  validasiBarisUmkm,
  type UmkmImporInput,
} from "./umkm-impor.rules";

/** Satu baris valid dari CSV beserta nomor barisnya di berkas (1 = header). */
export type BarisUmkm = UmkmImporInput & { baris: number };
/** Baris yang ditolak beserta alasannya (tanpa isi data). */
export type BarisUmkmDitolak = BarisDitolak;
/** Hasil parsing: baris valid, baris ditolak, dan galat berkas (header/ukuran/jumlah baris) bila ada. */
export type HasilCsvUmkm = HasilCsvImpor<UmkmImporInput>;

// Alias header sudah dinormalkan (huruf kecil, selain huruf/angka → spasi): "No. HP" → "no hp".
const KOLOM = {
  nama: ["nama", "nama umkm", "nama usaha"],
  pemilik: ["pemilik", "nama pemilik"],
  kategori: ["kategori", "kategori produk", "kategori umkm"],
  deskripsi: ["deskripsi"],
  alamat: ["alamat"],
  kontak: ["kontak", "telepon", "no hp", "no telepon", "whatsapp"],
} as const;

/**
 * Parse CSV UMKM: baris pertama header (wajib memuat `nama`, `pemilik`, `kategori`; opsional `deskripsi`,
 * `alamat`, `kontak`; alias umum diterima), baris kosong dilewati, baris tak valid ditolak.
 */
export function parseCsvUmkm(teks: string): HasilCsvUmkm {
  return parseCsvImpor(teks, {
    kolom: KOLOM,
    wajib: ["nama", "pemilik", "kategori"],
    maksBaris: IMPOR_UMKM_MAKS_BARIS,
    maksBytes: IMPOR_UMKM_MAKS_BYTES,
    validasi: validasiBarisUmkm,
  });
}

/** Isi template CSV: pemisah ";" agar terbuka benar di Excel lokal Indonesia, UTF-8 dengan BOM, 2 baris contoh rekaan. */
export function buatTemplateCsvUmkm(): string {
  return buatBerkasCsv([
    ["nama", "pemilik", "kategori", "deskripsi", "alamat", "kontak"],
    ["Warung Sate Bu Komang", "Ni Komang Ayu", "Makanan", "Sate dan lawar khas Bali", "Br. Dinas Contoh, Darmasaba", "081234567890"],
    ["Kerajinan Bambu Pak Wayan", "I Wayan Contoh", "Kerajinan", "", "Br. Dinas Contoh 2, Darmasaba", ""],
  ]);
}
