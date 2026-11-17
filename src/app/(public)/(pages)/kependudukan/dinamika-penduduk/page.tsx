import { permanentRedirect } from 'next/navigation';
import { kependudukanSectionHref } from '../_com/frame/kependudukan.meta';

/**
 * Alamat lama "Dinamika Penduduk" (href navbar 8.3, tetap dipakai sebagai menuKey visibilitas): isinya kini section
 * #dinamika di Dashboard Kependudukan → alihkan permanen.
 */
export default function Page() {
  permanentRedirect(kependudukanSectionHref('dinamika'));
}
