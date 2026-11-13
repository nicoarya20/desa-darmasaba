'use client';
import { useParams } from 'next/navigation';
import { PencegahanDetail } from '../_com/detail/PencegahanDetail';

/** Detail program pencegahan kriminalitas berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <PencegahanDetail id={params.id} />;
}
