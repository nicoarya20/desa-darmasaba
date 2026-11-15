import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { IconCalendarStats, IconCoin, IconUsers } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { Ringkasan } from './beasiswa.logic';
import s from './beasiswa.module.css';
import { BEASISWA_TEXT as T } from './beasiswa.text';
import { TileMessage, TileSkeleton } from './BeasiswaStatus';

type Props = { state: LoadState<Ringkasan>; onRetry: () => void };

type Stat = { icon: ReactNode; label: string; value: string | null; empty: string; note: string | null };

/** Ubin angka: pendaftar, dana tersalurkan (Rp ringkas + penuh), tahun ajaran. */
export function BeasiswaRingkasan({ state, onRetry }: Props) {
  return (
    <section className={s.section} aria-labelledby="beasiswa-ringkasan">
      <h2 id="beasiswa-ringkasan" className={s.sectionTitle}>{T.ringkasanTitle}</h2>
      {state.status === 'ready' ? (
        <StatTiles data={state.data} />
      ) : state.status === 'error' ? (
        <TileMessage text={T.ringkasanError} onRetry={onRetry} />
      ) : (
        <TileSkeleton count={3} label={T.ringkasanLoading} />
      )}
    </section>
  );
}

function StatTiles({ data }: { data: Ringkasan }) {
  const icon = { size: 28, stroke: 1.6, 'aria-hidden': true } as const;
  const stats: Stat[] = [
    { icon: <IconUsers {...icon} />, label: T.pendaftar, value: String(data.pendaftar), empty: '0', note: T.pendaftarNote },
    { icon: <IconCoin {...icon} />, label: T.dana, value: data.danaRingkas, empty: T.danaEmpty, note: data.danaPenuh },
    { icon: <IconCalendarStats {...icon} />, label: T.tahunAjaran, value: data.tahunAjaran, empty: T.tahunAjaranEmpty, note: T.tahunAjaranNote },
  ];
  return (
    <ul className={s.grid} role="list">
      {stats.map((stat) => (
        <li key={stat.label} className={s.tile}>
          <span className={s.tileIcon}>{stat.icon}</span>
          <p className={s.tileLabel}>{stat.label}</p>
          <p className={stat.value ? s.tileValue : `${s.tileValue} ${s.tileValueMuted}`}>{stat.value ?? stat.empty}</p>
          {stat.note && <p className={s.tileNote}>{stat.note}</p>}
        </li>
      ))}
    </ul>
  );
}
