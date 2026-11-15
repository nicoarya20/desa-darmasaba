import { permanentRedirect } from 'next/navigation';
import { BEASISWA_HREF, BEASISWA_SYARAT_ID } from '../_com/beasiswa.meta';

/** Alamat lama "Pelajari Lebih Lanjut": isinya (syarat & alur) kini di halaman utama → alihkan permanen ke #syarat. */
export default function PelajariLebihLanjutPage() {
  permanentRedirect(`${BEASISWA_HREF}#${BEASISWA_SYARAT_ID}`);
}
