'use client';
import { useParams } from 'next/navigation';
import { ProgramKreatifDetail } from '../_com/detail/ProgramKreatifDetail';

/** Detail program kreatif desa berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <ProgramKreatifDetail id={params.id} />;
}
