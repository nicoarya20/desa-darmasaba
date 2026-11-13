'use client';
import { useParams } from 'next/navigation';
import { DetailTokoView } from '../_com/detail-toko/DetailTokoView';

/** Detail toko UMKM publik (`/ekonomi/umkm/[id]`); isi halaman di `_com/detail-toko`. */
export default function DetailTokoPage() {
  const params = useParams<{ id: string }>();
  return <DetailTokoView id={params.id} />;
}
