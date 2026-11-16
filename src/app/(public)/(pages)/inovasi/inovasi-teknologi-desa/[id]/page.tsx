'use client';
import { useParams } from 'next/navigation';
import { InovasiDetail } from '../_com/detail/InovasiDetail';

/** Detail satu Inovasi Teknologi Desa berdasarkan `id` (id lama Desa Digital / Info Teknologi tetap berlaku). */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <InovasiDetail id={params.id} />;
}
