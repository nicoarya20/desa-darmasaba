import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { ReactNode } from 'react';
import s from './terkait.module.css';

/** Label `aside` bawaan ubin tautan silang. */
export const TERKAIT_LABEL_DEFAULT = 'Halaman terkait';

type Props = {
  href: string;
  /** Ikon garis 32px, mis. `<IconLifebuoy size={32} />` (garis ditipiskan di CSS). */
  icon: ReactNode;
  title: string;
  text: string;
  /** Teks aksi di kanan ubin, mis. "Lihat program". */
  aksi: string;
  /** `aria-label` aside; bawaan "Halaman terkait". */
  label?: string;
};

/**
 * Ubin tautan silang antarhalaman menu Ekonomi (`#f5f5f7`, seluruh ubin = satu tautan): ikon, judul h2 + satu kalimat,
 * aksi "… ›". Membutuhkan variabel warna kerangka Kabar (--brand, --muted, --tile, --radius).
 */
export function EkonomiTerkait({ href, icon, title, text, aksi, label = TERKAIT_LABEL_DEFAULT }: Props) {
  return (
    <aside aria-label={label}>
      <Link href={href} className={`${s.terkait} ${r.trigger}`}>
        <span className={s.icon} aria-hidden>
          {icon}
        </span>
        <span className={s.body}>
          <h2 className={s.title}>{title}</h2>
          <span className={s.text}>{text}</span>
        </span>
        <span className={s.aksi} aria-hidden>
          <span className={r.cta} data-text={aksi}>
            {aksi}
          </span>
          <IconChevronRight className={r.chevron} size={16} stroke={2} />
        </span>
      </Link>
    </aside>
  );
}
