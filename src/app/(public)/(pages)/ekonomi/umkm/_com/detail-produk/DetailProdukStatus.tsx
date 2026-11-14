import { KatalogEmpty } from '../katalog/KatalogEmpty';
import { DETAIL_PRODUK_TEXT as T } from './detail-produk.text';
import type { DetailProdukState } from './detail-produk.types';
import s from './detail-produk.module.css';

const SKELETON_LINES = ['40%', '85%', '30%', '50%', '100%'];

type Props = { status: Exclude<DetailProdukState['status'], 'ready'>; onRetry: () => void };

/** Keadaan selain siap: kerangka memuat, produk tidak ditemukan, atau galat dengan tombol coba lagi. */
export function DetailProdukStatus({ status, onRetry }: Props) {
  if (status === 'loading') {
    return (
      <div className={`${s.status} ${s.skeletonGrid}`} role="status" aria-label={T.memuat}>
        <div className={s.skeletonMedia} aria-hidden="true" />
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
        <KatalogEmpty title={T.errorTitle} description={T.errorDesc} actionLabel={T.retry} onAction={onRetry} />
      )}
    </div>
  );
}
