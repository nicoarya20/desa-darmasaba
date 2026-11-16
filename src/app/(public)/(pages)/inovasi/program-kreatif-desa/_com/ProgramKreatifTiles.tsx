import { IconMapper, type IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { ProgramKreatifItem } from './program-kreatif.logic';
import s from './program-kreatif.module.css';
import { PROGRAM_KREATIF_TEXT as T } from './program-kreatif.text';

/** Ubin program `#f5f5f7` (3/2/1 kolom), seluruh ubin = tautan detail: ikon garis, judul, deskripsi singkat, "Selengkapnya ›". */
export function ProgramKreatifTiles({ items }: { items: readonly ProgramKreatifItem[] }) {
  return (
    <ul className={s.tiles} aria-label={T.listLabel}>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={s.tile}>
            {item.icon ? (
              <span className={s.icon} aria-hidden>
                <IconMapper name={item.icon as IconKey} size={32} color="currentColor" />
              </span>
            ) : null}
            <h3 className={s.title}>{item.title}</h3>
            {item.summary ? <span className={s.summary}>{item.summary}</span> : null}
            <span className={s.more} aria-hidden>
              {T.selengkapnya}
              <IconChevronRight size={16} stroke={2} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Kerangka memuat: `count` ubin berdenyut. */
export function ProgramKreatifPlaceholder({ count }: { count: number }) {
  return (
    <ul className={s.tiles} aria-busy="true" aria-label={T.loading}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${s.tile} ${kabar.placeholder}`} aria-hidden />
      ))}
    </ul>
  );
}
