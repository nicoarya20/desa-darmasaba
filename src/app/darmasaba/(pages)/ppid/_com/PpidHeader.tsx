import type { ReactNode } from 'react';
import s from './ppid-header.module.css';

type Props = {
  title: string;
  lead: string;
  /** Kontrol di kanan judul (mis. kotak cari); di layar sempit turun ke bawah pengantar. */
  aside?: ReactNode;
};

/** Kepala halaman PPID: judul + pengantar rata kiri, slot opsional di kanan (mobile di bawah). */
export function PpidHeader({ title, lead, aside }: Props) {
  return (
    <header className={s.header}>
      <div className={s.intro}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.lead}>{lead}</p>
      </div>
      {aside ? <div className={s.aside}>{aside}</div> : null}
    </header>
  );
}
