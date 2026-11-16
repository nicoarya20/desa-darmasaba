'use client';
import f from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import frame from '../../../_com/page-frame/page-frame.module.css';
import { perpusListHref, SEMUA_SLUG } from '../perpus-katalog.logic';
import k from '../perpus-katalog.module.css';
import { PERPUS_BRAND_VARS } from '../perpus.meta';
import { BUKU_DETAIL_TEXT as T } from '../perpus.text';
import { BukuDetailBody } from './BukuDetailBody';
import { BukuDetailStatus } from './BukuDetailStatus';
import { useBukuDetail } from './use-buku-detail';

/**
 * Halaman detail buku (`/pendidikan/perpustakaan-digital/{kategori}/{id}`) gaya detail produk UMKM: tautan kembali,
 * sampul | info (kategori, judul, deskripsi, Pinjam, Cara meminjam), lalu rel buku lain di kategori yang sama.
 * Kerangka dari page-frame Pendidikan (bukan detail-umkm 1120) agar tepi sama dengan katalog; tautan kembali dan
 * gayanya tetap dari detail UMKM.
 */
export function BukuDetail({ id }: { id: string }) {
  const { state, reload } = useBukuDetail(id);

  return (
    <div
      className={`${frame.frame} ${k.page}`}
      style={PERPUS_BRAND_VARS}
      aria-busy={state.status === 'loading' || undefined}
    >
      <div className={frame.inner}>
        <Link href={perpusListHref(SEMUA_SLUG)} className={f.back}>
          <IconChevronLeft size={16} stroke={2} aria-hidden="true" />
          {T.kembali}
        </Link>
        {state.status === 'ready' ? (
          <BukuDetailBody buku={state.data} />
        ) : (
          <BukuDetailStatus status={state.status} onRetry={reload} />
        )}
      </div>
    </div>
  );
}
