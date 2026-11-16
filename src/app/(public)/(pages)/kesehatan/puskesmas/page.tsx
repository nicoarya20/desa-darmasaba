import { LABEL_PUSTU } from '@/lib/pustu/pustu.label';
import type { Metadata } from 'next';
import PustuListPage from './_com/PustuListPage';

export const metadata: Metadata = {
  title: LABEL_PUSTU,
  description: 'Jam operasional, layanan unggulan, prosedur pendaftaran, tarif, dan kontak PUSTU Desa Darmasaba.',
};

/** Daftar PUSTU (Puskesmas Pembantu) Desa Darmasaba. */
export default function Page() {
  return <PustuListPage />;
}
