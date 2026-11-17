import { permanentRedirect } from 'next/navigation';
import { kependudukanSectionHref } from '../_com/frame/kependudukan.meta';

/**
 * Alamat lama "Distribusi Umur" (dulu submenu navbar, kini dihapus): isinya section #umur di Dashboard Kependudukan.
 * Dipertahankan sebagai pengalihan permanen untuk bookmark dan hasil mesin pencari.
 */
export default function Page() {
  permanentRedirect(kependudukanSectionHref('umur'));
}
