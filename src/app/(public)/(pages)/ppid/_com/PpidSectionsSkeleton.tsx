import { Skeleton } from '@mantine/core';
import s from './ppid-sections.module.css';

type Props = { label: string; rows?: number };

/** Kerangka pemuatan isi teks halaman PPID (baris abu selebar isi). */
export function PpidSectionsSkeleton({ label, rows = 4 }: Props) {
  return (
    <div className={s.skeleton} role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} h={28} radius="md" w={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
