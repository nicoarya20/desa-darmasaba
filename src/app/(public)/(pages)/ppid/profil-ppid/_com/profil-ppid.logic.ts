import { sanitizeRichText } from '@/lib/rich-text';
import { PROFIL_LEMBAGA_TEXT as T } from './profil-ppid.text';

/** Bentuk minimal profil lembaga dari `GET /api/ppid/profillembagappid/find`. */
export type ProfilLembagaPublik = {
  deskripsi: string | null;
  tujuan: string | null;
  tugasFungsi: string | null;
  gambarAlur?: { link: string } | null;
};

/** Satu bagian teks profil lembaga yang siap tampil: `html` sudah lewat `sanitizeRichText`. */
export type ProfilLembagaBagian = { key: 'deskripsi' | 'tujuan' | 'tugasFungsi'; label: string; html: string };

const BAGIAN: readonly { key: ProfilLembagaBagian['key']; label: string }[] = [
  { key: 'deskripsi', label: T.deskripsi },
  { key: 'tujuan', label: T.tujuan },
  { key: 'tugasFungsi', label: T.tugasFungsi },
];

/** Bagian teks berisi (urut: deskripsi, tujuan, tugas & fungsi) dengan HTML tersaring; bagian kosong dibuang. */
export function profilLembagaBagian(data: ProfilLembagaPublik): ProfilLembagaBagian[] {
  return BAGIAN.map(({ key, label }) => ({ key, label, html: sanitizeRichText(data[key]) })).filter((bagian) => bagian.html !== '');
}

/** True bila profil lembaga punya setidaknya satu bagian teks atau gambar alur; bila tidak, halaman tampil seperti semula. */
export function hasProfilLembagaContent(data: ProfilLembagaPublik | null | undefined): data is ProfilLembagaPublik {
  if (!data) return false;
  return Boolean(data.gambarAlur?.link) || profilLembagaBagian(data).length > 0;
}
