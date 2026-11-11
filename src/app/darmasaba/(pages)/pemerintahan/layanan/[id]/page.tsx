'use client';
import { useParams } from 'next/navigation';
import { LayananDetail } from '../_com/detail/LayananDetail';

/** Detail satu layanan surat keterangan. */
export default function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <LayananDetail id={id} />;
}
