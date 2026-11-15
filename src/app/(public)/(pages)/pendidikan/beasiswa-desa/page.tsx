import type { Metadata } from 'next';
import { BeasiswaPage } from './_com/BeasiswaPage';
import { BEASISWA_TEXT } from './_com/beasiswa.text';

export const metadata: Metadata = { title: BEASISWA_TEXT.title };

/** Beasiswa Desa: info program, syarat & alur, dan formulir pendaftaran. */
export default function Page() {
  return <BeasiswaPage />;
}
