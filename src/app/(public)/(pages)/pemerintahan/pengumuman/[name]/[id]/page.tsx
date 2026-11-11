'use client';
import { useParams } from 'next/navigation';
import { PengumumanDetail } from '../../_com/detail/PengumumanDetail';

/** Detail pengumuman; segmen kategori di URL hanya kosmetik, data dibaca dari `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <PengumumanDetail id={params.id} />;
}
