import { permanentRedirect } from 'next/navigation';
import { kependudukanSectionHref } from '../_com/frame/kependudukan.meta';

/**
 * Alamat lama "Distribusi Umur" (href navbar 8.5, tetap dipakai sebagai menuKey visibilitas): isinya kini section
 * #umur di Dashboard Kependudukan → alihkan permanen.
 */
export default function Page() {
  permanentRedirect(kependudukanSectionHref('umur'));
}
