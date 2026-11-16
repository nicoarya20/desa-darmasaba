import { permanentRedirect } from 'next/navigation';
import { INFO_SEKOLAH_PATH, LEMBAGA_ANCHOR } from '../_com/info-sekolah.logic';

/**
 * Daftar lembaga kini menjadi panel "Sekolah per jenjang" di halaman utama (19 sekolah, tanpa perlu tabel/cari).
 * Tautan lama `/lembaga` (juga `?jenjang=` dari next.config) → panel itu.
 */
export default function Page(): never {
  return permanentRedirect(`${INFO_SEKOLAH_PATH}#${LEMBAGA_ANCHOR}`);
}
