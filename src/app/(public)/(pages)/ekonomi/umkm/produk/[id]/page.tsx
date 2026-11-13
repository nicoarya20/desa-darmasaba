'use client';
import { useParams } from 'next/navigation';
import { DetailProdukView } from '../../_com/detail-produk/DetailProdukView';

/** Detail produk UMKM publik (`/ekonomi/umkm/produk/[id]`); isi halaman di `_com/detail-produk`. */
export default function DetailProdukPage() {
  const params = useParams<{ id: string }>();
  return <DetailProdukView id={params.id} />;
}
