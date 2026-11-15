import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import type { Keunggulan } from './beasiswa.logic';
import s from './beasiswa.module.css';
import { BEASISWA_TEXT as T } from './beasiswa.text';
import { TileMessage, TileSkeleton } from './BeasiswaStatus';

type Props = { state: LoadState<Keunggulan[]>; onRetry: () => void };

/** Keunggulan program dari CMS: semua item sekaligus (tanpa paginasi), deskripsi teks polos. */
export function BeasiswaKeunggulan({ state, onRetry }: Props) {
  return (
    <section className={s.section} aria-labelledby="beasiswa-keunggulan">
      <div className={s.sectionHead}>
        <h2 id="beasiswa-keunggulan" className={s.sectionTitle}>{T.keunggulanTitle}</h2>
        <p className={s.sectionLead}>{T.keunggulanLead}</p>
      </div>
      {state.status === 'ready' ? (
        state.data.length === 0 ? (
          <TileMessage text={T.keunggulanEmpty} />
        ) : (
          <ul className={s.grid} role="list">
            {state.data.map((item) => (
              <li key={item.id} className={s.tile}>
                <h3 className={s.tileTitle}>{item.judul}</h3>
                {item.deskripsi && <p className={s.tileText}>{item.deskripsi}</p>}
              </li>
            ))}
          </ul>
        )
      ) : state.status === 'error' ? (
        <TileMessage text={T.keunggulanError} onRetry={onRetry} />
      ) : (
        <TileSkeleton count={3} label={T.keunggulanLoading} />
      )}
    </section>
  );
}
