import { jenisKontak, type LembagaKomunitasRecord } from '@/lib/lembaga-komunitas';

/** Panjang deskripsi (karakter) yang tampil sebelum "Selengkapnya"; deskripsi yang lebih pendek tampil utuh. */
export const DESKRIPSI_RINGKAS_MAX = 160;

/** Bagian awal potongan yang boleh dibuang demi memotong di batas kata (di bawah ini potong di tengah kata). */
const POTONG_KATA_MIN_RASIO = 0.6;

/** Satu kelompok jenis: `kunci` (huruf kecil) menyatukan ejaan "PKK" dan "pkk"; `jenis` = ejaan pertama yang ditemui. */
export type LembagaGrup = { kunci: string; jenis: string; items: LembagaKomunitasRecord[] };

const bandingId = (a: string, b: string) => a.localeCompare(b, 'id', { sensitivity: 'base' });

/**
 * Kelompokkan lembaga per jenis (tanpa beda huruf besar-kecil). Kelompok urut A-Z; di dalam kelompok urut `urutan`
 * (kecil dulu) lalu nama. Urutan dihitung di sini, tidak bergantung pada urutan respons API.
 */
export function kelompokkanPerJenis(items: readonly LembagaKomunitasRecord[]): LembagaGrup[] {
  const peta = new Map<string, LembagaGrup>();
  for (const item of items) {
    const kunci = item.jenis.trim().toLocaleLowerCase('id');
    const grup = peta.get(kunci) ?? { kunci, jenis: item.jenis.trim(), items: [] };
    grup.items.push(item);
    peta.set(kunci, grup);
  }
  const grups = [...peta.values()];
  for (const grup of grups) grup.items.sort((a, b) => a.urutan - b.urutan || bandingId(a.nama, b.nama));
  return grups.sort((a, b) => bandingId(a.jenis, b.jenis));
}

/** Tautan `mailto:` / `tel:` untuk kontak lembaga; bentuk lain (data lama di luar aturan) → null, tampil sebagai teks biasa. */
export function kontakHref(kontak: string): string | null {
  const jenis = jenisKontak(kontak);
  if (jenis === 'email') return `mailto:${kontak}`;
  if (jenis === 'telepon') return `tel:${kontak.replace(/[^\d+]/g, '')}`;
  return null;
}

/**
 * Ringkasan deskripsi untuk kartu: utuh bila ≤ `max`; selain itu dipotong di batas kata terakhir (bila tidak terlalu
 * jauh ke belakang) dan diakhiri "…". Spasi/baris baru dirapatkan karena ringkasan satu paragraf.
 */
export function potongDeskripsi(teks: string, max: number = DESKRIPSI_RINGKAS_MAX): { ringkas: string; terpotong: boolean } {
  const rapat = teks.replace(/\s+/g, ' ').trim();
  if (rapat.length <= max) return { ringkas: rapat, terpotong: false };
  const potong = rapat.slice(0, max);
  const batasKata = potong.lastIndexOf(' ');
  const dasar = batasKata >= max * POTONG_KATA_MIN_RASIO ? potong.slice(0, batasKata) : potong;
  return { ringkas: `${dasar.trimEnd()}…`, terpotong: true };
}
