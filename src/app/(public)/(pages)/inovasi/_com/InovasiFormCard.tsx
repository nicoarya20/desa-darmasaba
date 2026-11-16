import { useId, type ReactNode } from 'react';
import s from './inovasi-form.module.css';

type CardProps = {
  title: string;
  /** Kalimat pendek di bawah judul (opsional), mis. keterangan isian wajib. */
  lead?: string;
  children: ReactNode;
};

/**
 * Kartu formulir halaman Inovasi (Ajukan Ide, Administrasi Online): ubin #f5f5f7 radius 18 + judul h2,
 * isian satu kolom selebar kartu. Dipakai di dalam `PermohonanLayout` PPID di atas latar putih Kabar
 * (kartu putih `PermohonanFormCard` tidak terlihat di sana). Ukuran isian: `PERMOHONAN_FIELD`.
 */
export function InovasiFormCard({ title, lead, children }: CardProps) {
  const titleId = useId();
  return (
    <section className={s.card} aria-labelledby={titleId}>
      <div className={s.head}>
        <h2 id={titleId} className={s.title}>{title}</h2>
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
