import { LABEL_PUSTU } from '@/lib/pustu/pustu.label';
import type { Metadata } from 'next';
import PustuDetail from '../_com/detail/PustuDetail';

export const metadata: Metadata = { title: LABEL_PUSTU };

/** Detail PUSTU: info, layanan unggulan, prosedur, tarif, struktur, dan galeri. */
export default function Page() {
  return <PustuDetail />;
}
