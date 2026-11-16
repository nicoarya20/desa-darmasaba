import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconMapper, type IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import s from './program-tiles.module.css';

/** Satu ubin program: judul, ringkasan (boleh kosong), kunci ikon `IconMapper` (kosong → tanpa ikon), tautan detail. */
export type ProgramTileItem = {
  id: string;
  title: string;
  summary: string;
  /** Pemakai yang ingin "kunci tak dikenal → tanpa ikon" menyaringnya dulu dengan `isIconKey`. */
  icon?: string;
  href: string;
};

type TilesProps = {
  items: readonly ProgramTileItem[];
  /** Nama daftar untuk pembaca layar, mis. "Daftar program kreatif". */
  label: string;
  /** Teks tautan di dasar ubin, mis. "Selengkapnya". */
  moreLabel: string;
};

/** Ubin program `#f5f5f7` (3/2/1 kolom), seluruh ubin = tautan detail: ikon garis, judul, ringkasan, "Selengkapnya ›". */
export function ProgramTiles({ items, label, moreLabel }: TilesProps) {
  return (
    <ul className={s.tiles} aria-label={label}>
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
              {moreLabel}
              <IconChevronRight size={16} stroke={2} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Kerangka memuat: `count` ubin berdenyut; `label` = keterangan memuat untuk pembaca layar. */
export function ProgramTilesPlaceholder({ count, label }: { count: number; label: string }) {
  return (
    <ul className={s.tiles} aria-busy="true" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${s.tile} ${kabar.placeholder}`} aria-hidden />
      ))}
    </ul>
  );
}
