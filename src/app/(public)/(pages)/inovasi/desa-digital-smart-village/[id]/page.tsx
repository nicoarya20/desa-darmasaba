'use client';
import { useParams } from 'next/navigation';
import { DesaDigitalDetail } from '../_com/detail/DesaDigitalDetail';

/** Detail layanan desa digital berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <DesaDigitalDetail id={params.id} />;
}
