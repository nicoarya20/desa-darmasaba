'use client';
import { useParams } from 'next/navigation';
import { KegiatanDetail } from '../../_com/detail/KegiatanDetail';

/** Detail kegiatan desa; segmen kategori di URL hanya kosmetik, data dibaca dari `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <KegiatanDetail id={params.id} />;
}
