import { MUSIK_TEXT as T } from './musik-library.text';
import s from './musik-skeleton.module.css';

const CARDS = 6;
const ROWS = 6;

/** Kerangka berdenyut saat pustaka dimuat; denyut mati bila pengguna memilih gerak dikurangi. */
export function MusikSkeleton({ variant = 'home' }: { variant?: 'home' | 'list' }) {
  return (
    <div className={s.wrap} aria-busy="true" aria-live="polite">
      <span className={s.srOnly}>{T.memuat}</span>
      {variant === 'home' ? (
        <>
          <span className={s.heading} />
          <div className={s.cards} aria-hidden="true">
            {Array.from({ length: CARDS }, (_, i) => (
              <span key={i} className={s.card} />
            ))}
          </div>
        </>
      ) : null}
      <div className={s.rows} aria-hidden="true">
        {Array.from({ length: ROWS }, (_, i) => (
          <span key={i} className={s.row}>
            <span className={s.thumb} />
            <span className={s.line} />
          </span>
        ))}
      </div>
    </div>
  );
}
