/**
 * Logika murni Kontak Darurat Keamanan: kategori API (kontakdaruratkeamanan) → kelompok berisi kontak,
 * kategori tanpa kontak dibuang, dan penyaring cari di klien.
 */
import { phoneDigits } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';

/** Satu kontak (KontakItem): nama instansi + nomor telepon; `icon` = kunci IconMapper admin. */
export type KontakItem = { id: string; nama: string; nomorTelepon?: string | null; icon?: string | null };

/**
 * Satu kategori dari `GET /api/keamanan/kontakdaruratkeamanan/findMany`. Relasi `kategori` sengaja diabaikan:
 * isinya hanya salinan kontak pertama yang dipilih saat create (lihat create.ts), bukan nomor utama kategori.
 */
export type KategoriKontak = {
  id: string;
  nama: string;
  icon?: string | null;
  kontakItems?: { id: string; kontakItem?: KontakItem | null }[] | null;
};

/** Kelompok siap tampil: kategori + kontaknya (`key` = id relasi, karena satu kontak bisa ada di 2 kategori). */
export type KontakGroup = {
  id: string;
  nama: string;
  icon: string | null;
  items: (KontakItem & { key: string })[];
};

/** Kategori → kelompok, urutan API dipertahankan; kategori tanpa kontak (mis. "SAR & Evakuasi") disembunyikan. */
export function toGroups(kategori: readonly KategoriKontak[]): KontakGroup[] {
  return kategori
    .map((k) => ({
      id: k.id,
      nama: k.nama,
      icon: k.icon ?? null,
      items: (k.kontakItems ?? []).flatMap((rel) => (rel.kontakItem ? [{ ...rel.kontakItem, key: rel.id }] : [])),
    }))
    .filter((group) => group.items.length > 0);
}

/** Jumlah baris kontak di semua kelompok. */
export const countItems = (groups: readonly KontakGroup[]) => groups.reduce((n, g) => n + g.items.length, 0);

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
const MIN_DIGIT_QUERY = 3;

/**
 * Saring kelompok: nama kategori cocok → seluruh kontaknya tampil; selain itu hanya kontak yang nama atau
 * digit nomornya cocok. Kelompok tanpa sisa kontak dibuang. Huruf besar/kecil & spasi ganda diabaikan.
 */
export function filterGroups(groups: readonly KontakGroup[], query: string): KontakGroup[] {
  const q = normalize(query);
  if (!q) return [...groups];
  const qDigits = phoneDigits(q);
  const digitQuery = qDigits.length >= MIN_DIGIT_QUERY && q.replace(/[\s()+-]/g, '') === qDigits;
  return groups.flatMap((group) => {
    if (normalize(group.nama).includes(q)) return [group];
    const items = group.items.filter(
      (item) =>
        normalize(item.nama).includes(q) || (digitQuery && phoneDigits(item.nomorTelepon).includes(qDigits)),
    );
    return items.length > 0 ? [{ ...group, items }] : [];
  });
}
