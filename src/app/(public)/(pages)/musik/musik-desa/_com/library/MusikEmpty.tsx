import type { ReactNode } from 'react';
import s from './musik-empty.module.css';

type Props = { icon: ReactNode; title: string; body: string };

/** Panel keadaan kosong (pustaka kosong, hasil saring kosong, playlist kosong). */
export function MusikEmpty({ icon, title, body }: Props) {
  return (
    <div className={s.empty}>
      <span className={s.icon} aria-hidden="true">
        {icon}
      </span>
      <h2 className={s.title}>{title}</h2>
      <p className={s.body}>{body}</p>
    </div>
  );
}
