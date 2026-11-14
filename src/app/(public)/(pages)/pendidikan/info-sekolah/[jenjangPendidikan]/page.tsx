import { permanentRedirect } from 'next/navigation';
import { INFO_SEKOLAH_PATH } from '../_com/info-sekolah.logic';

/**
 * Tautan lama `/pendidikan/info-sekolah/{semua|jenjang}` (ringkasan per jenjang, sudah dihapus) → ringkasan tunggal.
 * Segmen statis `lembaga|siswa|pengajar` lebih diutamakan Next daripada segmen dinamis ini, jadi tidak ikut tertangkap.
 * Boleh dihapus bila tautan lama sudah tidak beredar (dibagikan warga / terindeks mesin pencari).
 */
export default function Page(): never {
  return permanentRedirect(INFO_SEKOLAH_PATH);
}
