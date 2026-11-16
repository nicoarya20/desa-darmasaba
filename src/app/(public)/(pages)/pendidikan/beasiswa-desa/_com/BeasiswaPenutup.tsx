import s from './beasiswa.module.css';
import { BEASISWA_TEXT as T } from './beasiswa.text';

/** Panel penutup ajakan mendaftar. */
export function BeasiswaPenutup({ onDaftar }: { onDaftar: () => void }) {
  return (
    <section className={s.closing} aria-labelledby="beasiswa-penutup">
      <div>
        <h2 id="beasiswa-penutup" className={s.closingTitle}>{T.penutupTitle}</h2>
        <p className={s.closingText}>{T.penutupText}</p>
      </div>
      <button type="button" className={s.pill} onClick={onDaftar} aria-haspopup="dialog">
        {T.daftar}
      </button>
    </section>
  );
}
