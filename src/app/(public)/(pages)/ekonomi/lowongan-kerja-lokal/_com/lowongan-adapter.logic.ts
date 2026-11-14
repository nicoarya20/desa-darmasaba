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
 * mis. "3 juta" (angka 3) atau "2.500" (ribuan), supaya tidak tampil sebagai "Rp3".
 */
export const GAJI_MIN_WAJAR = 100_000;

/** Digit terbanyak yang masih dibaca sebagai nominal gaji; lebih panjang dari ini dianggap salah ketik. */
const GAJI_MAX_DIGITS = 12;

/** Desimal rupiah di akhir teks (`,dd` atau `,d`), mis. ",00" pada "2.500.000,00". */
const GAJI_DESIMAL_AKHIR = /,\d{1,2}\s*$/;

/** Satu angka: kelompok ribuan bertitik/berkoma ("2.500.000") atau deret digit polos ("2000000"). */
const GAJI_ANGKA = /\d{1,3}(?:[.,]\d{3})+|\d+/g;

/**
 * Kata pada alamat `lokasi` yang menandai lowongan di dalam desa.
 * MITIGASI SEMENTARA(lowongan-wilayah): belum ada kolom wilayah; tebakan dari teks alamat, lihat docs/BACKEND-TODO.md P3.
 * Keterbatasan diketahui: alamat tanpa kata ini ("Jl. Antasura No.22") terbaca luar desa; jangan ditambal dengan daftar jalan.
 */
export const DESA_KATA_KUNCI = 'darmasaba';

/** Rapikan teks bebas: buang spasi tepi, spasi beruntun jadi satu. */
function tidy(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Kunci saring/URL dari teks bebas: dirapikan lalu huruf kecil, mis. " Full  Time " → "full time". */
export function toKey(value: string): string {
  return tidy(value).toLocaleLowerCase('id');
}

/**
 * Rupiah per bulan dari teks bebas `gaji`. Lebih baik "tidak dicantumkan" daripada nominal yang salah baca:
 * 1. desimal di akhir dibuang dulu ("2.500.000,00" → 2500000, bukan 250000000);
 * 2. teks harus memuat tepat satu angka; tanpa angka atau lebih dari satu (rentang "500.000-900.000",
 *    "2 s/d 3 juta", pecahan "1,5jt") → null;
 * 3. lebih dari GAJI_MAX_DIGITS digit atau di bawah GAJI_MIN_WAJAR → null.
 */
export function parseGaji(gaji: string): number | null {
  const angka = gaji.replace(GAJI_DESIMAL_AKHIR, '').match(GAJI_ANGKA) ?? [];
  if (angka.length !== 1) return null;
  const digits = angka[0].replace(/\D/g, '');
  if (digits.length > GAJI_MAX_DIGITS) return null;
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
    tipe: tipe === '' ? null : tipe,
    tipeKey: tipe === '' ? null : toKey(tipe),
    lokasi: lokasi === '' ? null : lokasi,
    diDesa: lokasi.toLocaleLowerCase('id').includes(DESA_KATA_KUNCI),
    gaji: parseGaji(item.gaji),
    ringkasan: htmlToText(item.deskripsi),
    tayangMs: tayangMsOf(item),
  };
}
