import { permanentRedirect } from 'next/navigation';
import { kependudukanSectionHref } from '../_com/frame/kependudukan.meta';

/**
 * Alamat lama "Data per Banjar" (href navbar 8.2, tetap dipakai sebagai menuKey visibilitas): isinya kini section
 * #banjar di Dashboard Kependudukan → alihkan permanen.
 */
export default function Page() {
  permanentRedirect(kependudukanSectionHref('banjar'));
}
