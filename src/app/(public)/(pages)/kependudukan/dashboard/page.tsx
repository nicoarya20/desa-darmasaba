import type { Metadata } from 'next';
import { KependudukanPage } from '../_com/frame/KependudukanPage';
import { KEPENDUDUKAN_TEXT } from '../_com/frame/kependudukan.text';

export const metadata: Metadata = { title: KEPENDUDUKAN_TEXT.title };

/** Dashboard Kependudukan: ringkasan, per banjar, umur, agama, dan dinamika penduduk dalam satu halaman. */
export default function Page() {
  return <KependudukanPage />;
}
