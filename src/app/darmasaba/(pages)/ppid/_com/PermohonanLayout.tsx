import type { ReactNode } from 'react';
import s from './permohonan.module.css';

type LayoutProps = { aside: ReactNode; children: ReactNode };

/** Tata letak halaman permohonan PPID (di dalam `PpidPage`, yang menyetel `--brand`): alur menempel di kiri + isi di kanan (≥75em), bertumpuk di bawahnya. */
export function PermohonanLayout({ aside, children }: LayoutProps) {
  return (
    <div className={s.layout}>
      <div className={s.aside}>{aside}</div>
      <div className={s.main}>{children}</div>
    </div>
  );
}

type CardProps = { title: string; children: ReactNode };

/** Kartu putih formulir permohonan: satu-satunya permukaan kartu di halaman, isian satu kolom selebar kartu. */
export function PermohonanFormCard({ title, children }: CardProps) {
  return (
    <section className={s.card}>
      <h2 className={s.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}
