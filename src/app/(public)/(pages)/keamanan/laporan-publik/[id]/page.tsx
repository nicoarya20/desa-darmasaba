'use client';
import { useParams } from 'next/navigation';
import { LaporanDetail } from '../_com/detail/LaporanDetail';

/** Detail satu laporan publik: kronologi, penanganan, dan status. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <LaporanDetail id={params.id} />;
}
