'use client';
import { useParams } from 'next/navigation';
import { PenghijauanDetailView } from '../_com/detail/PenghijauanDetail';

/** Detail program penghijauan berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <PenghijauanDetailView id={params.id} />;
}
