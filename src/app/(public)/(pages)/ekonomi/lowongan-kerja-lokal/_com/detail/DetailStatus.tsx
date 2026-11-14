import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { KatalogEmpty } from '../../../umkm/_com/katalog/KatalogEmpty';
import { LOWONGAN_BASE_HREF } from '../lowongan-filter.meta';
import st from './detail-status.module.css';
import s from './lowongan-detail.module.css';
import { LOWONGAN_DETAIL_TEXT as T } from './lowongan-detail.text';
import type { LowonganDetailState } from './lowongan-detail.types';

type Props = { status: Exclude<LowonganDetailState['status'], 'ready'>; onRetry: () => void };

/** Keadaan selain siap: kerangka kartu memuat, tidak ditemukan (termasuk nonaktif/terhapus), atau galat + Coba lagi. */
export function DetailStatus({ status, onRetry }: Props) {
  if (status === 'loading') {
    return (
      <div className={`${s.card} ${st.skeleton}`} role="status" aria-label={T.memuat}>
        <div className={st.skeletonHead} aria-hidden="true">
          <span className={`${st.bone} ${st.boneLogo}`} />
          <span className={st.skeletonLines}>
            <span className={`${st.bone} ${st.boneTitle}`} />
            <span className={`${st.bone} ${st.boneText}`} />
          </span>
        </div>
        <span className={`${st.bone} ${st.bonePills}`} aria-hidden="true" />
        <span className={`${st.bone} ${st.boneBlock}`} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={st.status} role={status === 'error' ? 'alert' : undefined}>
      {status === 'notFound' ? (
        <KatalogEmpty title={T.notFoundTitle} description={T.notFoundDesc} />
      ) : (
        <KatalogEmpty title={T.errorTitle} description={T.errorDesc} actionLabel={T.retry} onAction={onRetry} />
      )}
      <Link href={LOWONGAN_BASE_HREF} className={st.statusLink}>
        {T.lihatSemua}
        <IconChevronRight size={16} stroke={2} aria-hidden="true" />
      </Link>
    </div>
  );
}
