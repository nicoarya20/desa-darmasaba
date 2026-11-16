'use client';
import { useParams } from 'next/navigation';
import { KesejahteraanDetail } from '../_com/detail/KesejahteraanDetail';

/** Detail program kesejahteraan masyarakat berdasarkan `id`. */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <KesejahteraanDetail id={params.id} />;
}
