import type { ReactNode } from 'react';
import s from './musik-empty.module.css';

type Props = { icon: ReactNode; title: string; body: string; action?: ReactNode };

/** Panel keadaan kosong/gagal (pustaka kosong, gagal muat, hasil saring kosong, playlist kosong). */
export function MusikEmpty({ icon, title, body, action }: Props) {
  return (
    <div className={s.empty}>
      <span className={s.icon} aria-hidden="true">
        {icon}
      </span>
      <h2 className={s.title}>{title}</h2>
      <p className={s.body}>{body}</p>
      {action ? <div className={s.action}>{action}</div> : null}
    </div>
  );
}
