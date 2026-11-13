'use client';
import { useParams } from 'next/navigation';
import { ProgramDetail } from '../_com/detail/ProgramDetail';

/** Detail program kesehatan (kegiatan atau indikator) berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <ProgramDetail id={params.id} />;
}
