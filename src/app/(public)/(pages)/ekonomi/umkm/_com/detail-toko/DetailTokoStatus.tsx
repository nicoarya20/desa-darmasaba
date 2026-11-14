import { KatalogEmpty } from '../katalog/KatalogEmpty';
import { KatalogGrid } from '../katalog/KatalogGrid';
import { DETAIL_TOKO_TEXT as T } from './detail-toko.text';
import type { DetailTokoState } from './detail-toko.types';
import s from './detail-toko.module.css';

const SKELETON_LINES = ['20%', '55%', '45%', '80%'];
const SKELETON_PRODUK = 4;

type Props = { status: Exclude<DetailTokoState['status'], 'ready'>; onRetry: () => void };

/** Keadaan selain siap: kerangka kepala + grid produk, toko tidak ditemukan, atau galat dengan tombol coba lagi. */
export function DetailTokoStatus({ status, onRetry }: Props) {
  if (status === 'loading') {
    return (
      <div className={s.status} role="status" aria-label={T.memuat}>
        <div className={s.skeletonHeader} aria-hidden="true">
          <div className={s.skeletonFoto} />
          <div className={s.skeletonLines}>
            {SKELETON_LINES.map((width, i) => (
              <div key={i} className={s.skeletonLine} style={{ width }} />
            ))}
          </div>
        </div>
        <div className={s.skeletonProduk}>
          <KatalogGrid variant="produk" loading skeletonCount={SKELETON_PRODUK} />
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
