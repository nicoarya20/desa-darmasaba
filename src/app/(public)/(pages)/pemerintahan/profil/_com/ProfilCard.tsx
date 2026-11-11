import { Image, Skeleton } from '@mantine/core';
import { useId, type ReactNode } from 'react';
import s from './profil.module.css';

type CardProps = {
  title: string;
  /** Gambar di atas judul (lambang/maskot); kebanyakan section tanpa gambar. */
  emblem?: { src: string; alt: string };
  children: ReactNode;
};

/** Kartu section Profil Desa: kartu terang terpusat dengan judul h2, isi di bawahnya. */
export function ProfilCard({ title, emblem, children }: CardProps) {
  const id = useId();
  return (
    <section className={s.card} aria-labelledby={id}>
      {emblem ? <Image className={s.emblem} src={emblem.src} alt={emblem.alt} /> : null}
      <h2 id={id} className={s.title}>{title}</h2>
      {children}
    </section>
  );
}

type HeadingProps = { id: string; title: string; lead?: string; aside?: ReactNode };

/** Judul section tanpa kartu (bagan, daftar perbekel): h2 + pengantar opsional + kontrol opsional, rata tengah. */
export function ProfilHeading({ id, title, lead, aside }: HeadingProps) {
  return (
    <header className={s.heading}>
      <h2 id={id} className={s.title}>{title}</h2>
      {lead ? <p className={s.headingLead}>{lead}</p> : null}
      {aside ? <div className={s.headingAside}>{aside}</div> : null}
    </header>
  );
}

/** HTML dari editor admin dalam kolom baca. */
export function ProfilProse({ html, className }: { html: string; className?: string }) {
  return <div className={className ? `${s.prose} ${className}` : s.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Satu kalimat keadaan kosong di dalam kartu. */
export function ProfilEmpty({ children }: { children: ReactNode }) {
  return <p className={s.empty}>{children}</p>;
}

/** Kerangka kartu selama data section dimuat. */
export function ProfilCardSkeleton({ label, rows = 5 }: { label: string; rows?: number }) {
  return (
    <div className={s.skeleton} role="status" aria-label={label}>
      <Skeleton h={36} w="40%" radius="md" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} h={22} radius="md" w={i === rows - 1 ? '45%' : '70%'} />
      ))}
    </div>
  );
}
