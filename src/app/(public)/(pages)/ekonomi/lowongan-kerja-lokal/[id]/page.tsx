'use client';
import { useParams } from 'next/navigation';
import { LowonganDetail } from '../_com/detail/LowonganDetail';

/** Detail lowongan kerja publik (`/ekonomi/lowongan-kerja-lokal/{id}`); seluruh isi di `_com/detail/`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <LowonganDetail id={params.id} />;
}
