import { htmlToText } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import type { Lowongan } from './lowongan.types';

/**
 * Kolom lowongan dari `GET /api/ekonomi/lowongankerja/find-many` yang dibaca daftar publik.
 * `notelp`, `kualifikasi`, dan `isActive` sengaja tidak dibaca (API sudah menyaring yang aktif).
 */
export type LowonganApiItem = {
  id: string;
  posisi: string;
  namaPerusahaan: string;
  lokasi: string;
  tipePekerjaan: string;
  /** Teks bebas dari form admin, mis. "2.500.000" atau "2000000". */
  gaji: string;
  /** Teks polos (entri lama) atau HTML editor (entri baru). */
  deskripsi: string;
  tanggalPosting: string;
  createdAt: string;
};

/**
 * Gaji bulanan terkecil (rupiah) yang masih dianggap terbaca. Di bawah ini isian dianggap bukan nominal penuh,
 * mis. "1,5jt" (digit 15) atau "3 juta" (digit 3), supaya tidak tampil sebagai "Rp15".
 */
export const GAJI_MIN_WAJAR = 100_000;

/** Digit terbanyak yang masih dibaca sebagai satu nominal; lebih dari ini biasanya rentang ("2.000.000 - 3.000.000"). */
const GAJI_MAX_DIGITS = 12;

/** Rapikan teks bebas: buang spasi tepi, spasi beruntun jadi satu. */
function tidy(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Kunci saring/URL dari teks bebas: dirapikan lalu huruf kecil, mis. " Full  Time " → "full time". */
export function toKey(value: string): string {
  return tidy(value).toLocaleLowerCase('id');
}

/** Rupiah per bulan dari teks `gaji`: hanya digit yang dibaca; tanpa digit, terlalu panjang, atau di bawah GAJI_MIN_WAJAR → null. */
export function parseGaji(gaji: string): number | null {
  const digits = gaji.replace(/\D/g, '');
  if (digits === '' || digits.length > GAJI_MAX_DIGITS) return null;
  const value = Number(digits);
  return value >= GAJI_MIN_WAJAR ? value : null;
}

/** Epoch ms dari tanggal ISO; kosong atau tak terbaca → null. */
function toMs(value: string): number | null {
  const ms = Date.parse(value);
  return Number.isFinite(ms) && ms > 0 ? ms : null;
}

/** Waktu tayang (epoch ms): `createdAt`, lalu `tanggalPosting`; keduanya tak terbaca → 0. */
export function tayangMsOf(item: Pick<LowonganApiItem, 'createdAt' | 'tanggalPosting'>): number {
  return toMs(item.createdAt) ?? toMs(item.tanggalPosting) ?? 0;
}

/** Lowongan API → bentuk daftar publik (kunci saring, gaji angka, ringkasan teks polos, waktu tayang). */
export function toLowongan(item: LowonganApiItem): Lowongan {
  const tipe = tidy(item.tipePekerjaan);
  const lokasi = item.lokasi.trim();
  return {
    id: item.id,
    posisi: item.posisi.trim(),
    pemberiKerja: item.namaPerusahaan.trim(),
    pemberiKey: toKey(item.namaPerusahaan),
    tipe: tipe === '' ? null : tipe,
    tipeKey: tipe === '' ? null : toKey(tipe),
    lokasi: lokasi === '' ? null : lokasi,
    gaji: parseGaji(item.gaji),
    ringkasan: htmlToText(item.deskripsi),
    tayangMs: tayangMsOf(item),
  };
}
