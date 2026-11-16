import { permanentRedirect } from 'next/navigation';
import { INFO_SEKOLAH_PATH } from '../_com/info-sekolah.logic';

/**
 * Daftar nama siswa (data anak) tidak lagi ditampilkan publik; siswa hanya tampil sebagai angka per jenjang
 * di halaman utama. Tautan lama `/siswa` → halaman utama.
 */
export default function Page(): never {
  return permanentRedirect(INFO_SEKOLAH_PATH);
}
