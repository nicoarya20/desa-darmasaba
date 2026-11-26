import type { ReactNode } from 'react';
import s from './list-refresh.module.css';

type Props = { refreshing: boolean; children: ReactNode };

/** Wadah daftar: `aria-busy` + redup ringan selama data query baru dimuat (daftar lama tetap tampil). */
export function ListRefreshRegion({ refreshing, children }: Props) {
  return (
    <div className={s.region} aria-busy={refreshing ? 'true' : undefined}>
      {children}
    </div>
  );
}
