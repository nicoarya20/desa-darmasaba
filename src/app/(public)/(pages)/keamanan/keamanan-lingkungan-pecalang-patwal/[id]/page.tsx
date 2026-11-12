'use client';
import { useParams } from 'next/navigation';
import { KeamananLingkunganDetail } from '../_com/detail/KeamananLingkunganDetail';

/** Detail satu entri keamanan lingkungan berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <KeamananLingkunganDetail id={params.id} />;
}
