import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconMapper, type IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import r from '../link-reveal/link-reveal.module.css';
import { ProgramTileLogo } from './ProgramTileLogo';
import s from './program-tiles.module.css';

/**
 * Satu ubin program: judul, ringkasan (boleh kosong), kunci ikon `IconMapper` (kosong → tanpa ikon), logo opsional
 * (Program Inovasi), tautan detail. `logo` atau `initials` diisi → varian ubin ber-logo (`.tileLogo`).
 */
export type ProgramTileItem = {
  id: string;
  title: string;
  summary: string;
  /** Pemakai yang ingin "kunci tak dikenal → tanpa ikon" menyaringnya dulu dengan `isIconKey`. */
  icon?: string;
  /** URL logo program; diisi → kotak logo di atas judul (menggantikan ikon). */
  logo?: string;
  /** Inisial pengganti logo yang tidak ada / gagal dimuat (Program Inovasi: `programInitials`); diisi → ubin ber-logo. */
  initials?: string;
  href: string;
};

type TilesProps = {
  items: readonly ProgramTileItem[];
  /** Nama daftar untuk pembaca layar, mis. "Daftar program kreatif". */
  label: string;
  /** Teks tautan di dasar ubin, mis. "Selengkapnya". */
  moreLabel: string;
};

/**
 * Ubin program `#f5f5f7` (3/2/1 kolom), seluruh ubin = tautan detail: ikon garis, judul, ringkasan, "Selengkapnya ›".
 * Ubin ber-logo (`.tileLogo`): pelat logo bertinggi tetap; ponsel jadi baris (pelat kiri, teks kanan); gelap = pulau
 * terang #d9e1ea. Ubin ikon tidak terpengaruh varian ini.
 */
export function ProgramTiles({ items, label, moreLabel }: TilesProps) {
  return (
    <ul className={s.tiles} aria-label={label}>
      {items.map((item) => {
        const hasLogo = Boolean(item.logo || item.initials);
        const text = (
          <>
            <h3 className={s.title}>
              <span className={r.title}>{item.title}</span>
            </h3>
            {item.summary ? <span className={s.summary}>{item.summary}</span> : null}
          </>
        );
        return (
          <li key={item.id}>
            <Link href={item.href} className={hasLogo ? `${s.tile} ${s.tileLogo} ${r.trigger}` : `${s.tile} ${r.trigger}`}>
              {hasLogo ? (
                <ProgramTileLogo src={item.logo} initials={item.initials} />
              ) : item.icon ? (
                <span className={s.icon} aria-hidden>
                  <IconMapper name={item.icon as IconKey} size={32} color="currentColor" />
                </span>
              ) : null}
              {/* Pembungkus teks hanya di ubin ber-logo: `display: contents` di desktop, kolom kanan baris ponsel. */}
              {hasLogo ? <div className={s.text}>{text}</div> : text}
              <MoreLabel label={moreLabel} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** "Selengkapnya ›" di dasar ubin (dekoratif; seluruh ubin sudah tautan). */
function MoreLabel({ label }: { label: string }) {
  return (
    <span className={s.more} aria-hidden>
      <span className={r.cta} data-text={label}>
        {label}
      </span>
      <IconChevronRight className={r.chevron} size={16} stroke={2} />
    </span>
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
