import type { Metadata } from 'next';
import { MUSIK_PAGE_METADATA } from './_com/app/musik-page.meta';
import { MusikHome } from './_com/library/MusikHome';

export const metadata: Metadata = MUSIK_PAGE_METADATA.musik;

/** Musik (beranda aplikasi Musik Desa). */
export default function MusikDesaPage() {
  return <MusikHome />;
}
