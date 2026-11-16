import { useEffect, useId, useRef, type ReactNode } from 'react';
import s from './inovasi-form.module.css';

type CardProps = {
  title: string;
  /** Kalimat pendek di bawah judul (opsional), mis. keterangan isian wajib. */
  lead?: string;
  /**
   * Keadaan sesudah kirim sukses (formulir & tombol kirim di-unmount): judul diberi tabIndex -1 dan difokus saat mount
   * agar fokus tidak jatuh ke <body> dan judul dibacakan pembaca layar.
   */
  focusTitle?: boolean;
  children: ReactNode;
};

/**
 * Kartu formulir halaman Inovasi (Ajukan Ide, Administrasi Online): ubin #f5f5f7 radius 18 + judul h2,
 * isian satu kolom selebar kartu. Dipakai di dalam `PermohonanLayout` PPID di atas latar putih Kabar
 * (kartu putih `PermohonanFormCard` tidak terlihat di sana). Ukuran isian: `PERMOHONAN_FIELD`.
 */
export function InovasiFormCard({ title, lead, focusTitle, children }: CardProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);

  return (
    <section className={s.card} aria-labelledby={titleId}>
      <div className={s.head}>
        <h2
          id={titleId}
          ref={titleRef}
          tabIndex={focusTitle ? -1 : undefined}
          className={focusTitle ? `${s.title} ${s.titleFocus}` : s.title}
        >
          {title}
        </h2>
        {lead ? <p className={s.lead}>{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Baris tombol kirim di dasar kartu (di ponsel tombol selebar kartu). */
export function InovasiFormActions({ children }: { children: ReactNode }) {
  return <div className={s.actions}>{children}</div>;
}
