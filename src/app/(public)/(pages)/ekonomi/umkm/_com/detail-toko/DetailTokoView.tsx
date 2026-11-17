'use client';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import p from '../detail-umkm/detail-umkm.module.css';
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
 * detail-umkm.module.css, lalu kepala toko dan daftar produk toko. Tanpa panel Cara memesan; stok tidak tampil.
 */
export function DetailTokoView({ id }: { id: string }) {
  const { state, reload } = useDetailToko(id);

  return (
    <div className={p.page} aria-busy={state.status === 'loading' || undefined}>
      <div className={p.inner}>
        <Link href={BACK_HREF} className={`${p.back} ${r.trigger}`}>
          <IconChevronLeft className={r.chevronBack} size={16} stroke={2} aria-hidden="true" />
          <span className={r.cta} data-text={T.backToList}>
            {T.backToList}
          </span>
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
