import { permanentRedirect } from 'next/navigation';
import { kependudukanSectionHref } from '../_com/frame/kependudukan.meta';

/**
 * Alamat lama "Distribusi Agama" (dulu submenu navbar, kini dihapus): isinya section #agama di Dashboard Kependudukan.
 * Dipertahankan sebagai pengalihan permanen untuk bookmark dan hasil mesin pencari.
 */
export default function Page() {
  permanentRedirect(kependudukanSectionHref('agama'));
}
