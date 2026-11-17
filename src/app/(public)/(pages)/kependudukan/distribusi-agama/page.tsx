import { permanentRedirect } from 'next/navigation';
import { kependudukanSectionHref } from '../_com/frame/kependudukan.meta';

/**
 * Alamat lama "Distribusi Agama" (href navbar 8.4, tetap dipakai sebagai menuKey visibilitas): isinya kini section
 * #agama di Dashboard Kependudukan → alihkan permanen.
 */
export default function Page() {
  permanentRedirect(kependudukanSectionHref('agama'));
}
