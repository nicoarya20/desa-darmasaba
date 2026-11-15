import { KatalogEmpty } from '@/app/(public)/(pages)/ekonomi/umkm/_com/katalog/KatalogEmpty';
import { BUKU_DETAIL_TEXT as T } from '../perpus.text';
import type { BukuDetailState } from '../perpus.types';
import s from './buku-detail.module.css';

const SKELETON_LINES = ['30%', '80%', '100%', '90%', '45%'];

type Props = { status: Exclude<BukuDetailState['status'], 'ready'>; onRetry: () => void };

/** Keadaan selain siap: kerangka memuat, buku tidak ditemukan, atau galat dengan tombol coba lagi. */
export function BukuDetailStatus({ status, onRetry }: Props) {
  if (status === 'loading') {
    return (
      <div className={`${s.status} ${s.grid}`} role="status" aria-label={T.memuat}>
        <div className={s.skeletonCover} aria-hidden="true" />
        <div className={s.skeletonLines} aria-hidden="true">
          {SKELETON_LINES.map((width, i) => (
            <div key={i} className={s.skeletonLine} style={{ width }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={s.status} role={status === 'error' ? 'alert' : undefined}>
      {status === 'notFound' ? (
        <KatalogEmpty title={T.notFoundTitle} description={T.notFoundDesc} />
      ) : (
        <KatalogEmpty title={T.errorTitle} description={T.errorDesc} actionLabel={T.cobaLagi} onAction={onRetry} />
      )}
    </div>
  );
}
