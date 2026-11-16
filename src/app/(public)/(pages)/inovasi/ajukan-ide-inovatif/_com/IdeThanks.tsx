import { useEffect, useRef } from 'react';
import f from '../../_com/inovasi-form.module.css';
import { AJUKAN_IDE_TEXT as T } from './ajukan-ide.text';
import s from './ajukan-ide.module.css';

/** Keadaan terima kasih di tempat formulir setelah kirim sukses; fokus pindah ke judul agar terbaca pembaca layar. */
export function IdeThanks({ onAgain }: { onAgain: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className={f.card} aria-labelledby="ajukan-ide-thanks-title">
      <div className={f.head}>
        <h2 id="ajukan-ide-thanks-title" ref={titleRef} tabIndex={-1} className={`${f.title} ${s.thanksTitle}`}>
          {T.thanksTitle}
        </h2>
        <p className={f.lead}>{T.thanksText}</p>
      </div>
      <div>
        <button type="button" className={s.again} onClick={onAgain}>
          {T.again} <span aria-hidden>›</span>
        </button>
      </div>
    </section>
  );
}
