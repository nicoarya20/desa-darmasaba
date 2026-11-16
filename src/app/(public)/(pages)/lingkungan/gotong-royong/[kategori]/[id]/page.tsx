'use client';
import { KegiatanDetail } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/KegiatanDetail';
import { useParams } from 'next/navigation';
import { GOTONG_ROYONG_BASE_HREF } from '../../_com/gotong-royong.meta';
import { GOTONG_ROYONG_TEXT as T } from '../../_com/gotong-royong.text';

const LIST = { label: T.backToList, href: GOTONG_ROYONG_BASE_HREF };

/**
 * Detail kegiatan gotong royong = detail Kegiatan Desa dengan kembali "‹ Gotong Royong". Segmen kategori hanya kosmetik
 * dan kategori tidak dibatasi: cari global memetakan semua kegiatan desa ke URL ini (docs/BACKEND-TODO.md).
 */
export default function Page() {
  const params = useParams<{ id: string }>();
  return <KegiatanDetail id={params.id} list={LIST} />;
}
