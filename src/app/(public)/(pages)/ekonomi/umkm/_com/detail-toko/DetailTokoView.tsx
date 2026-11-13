'use client';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import p from '../detail-produk/detail-produk.module.css';
import { KATALOG_BRAND_VARS } from '../katalog/katalog-filter.meta';
import { emptyParams, katalogHref } from '../katalog/katalog-params.logic';
import { DETAIL_TOKO_TEXT as T } from './detail-toko.text';
import { DetailTokoStatus } from './DetailTokoStatus';
import { TokoHeader } from './TokoHeader';
import { TokoProduk } from './TokoProduk';
import { useDetailToko } from './use-detail-toko';

/** Tautan kembali membuka katalog di tab Toko. */
const BACK_HREF = katalogHref(emptyParams('toko'));

/**
 * Halaman detail toko UMKM, seragam dengan detail produk: kerangka `.page/.inner/.back` + token dipakai bersama dari
 * detail-produk.module.css, lalu kepala toko dan daftar produk toko. Tanpa panel Cara memesan; stok tidak tampil.
 */
export function DetailTokoView({ id }: { id: string }) {
  const { state, reload } = useDetailToko(id);

  return (
    <div className={p.page} style={KATALOG_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={p.inner}>
        <Link href={BACK_HREF} className={p.back}>
          <IconChevronLeft size={16} stroke={2} aria-hidden="true" />
          {T.backToList}
        </Link>
        {state.status === 'ready' ? (
          <>
            <TokoHeader toko={state.data} />
            <TokoProduk produk={state.data.produk} />
          </>
        ) : (
          <DetailTokoStatus status={state.status} onRetry={reload} />
        )}
      </div>
    </div>
  );
}
