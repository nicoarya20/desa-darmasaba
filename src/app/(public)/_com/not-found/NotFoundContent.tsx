'use client';

import { IconChevronRight, IconSearch } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { PETA_INFORMASI_HREF } from '../../(tambahan)/peta-informasi/_lib/petaInformasi';
import GlobalSearch from '../globalSearch';
import r from '../link-reveal/link-reveal.module.css';
import { NOT_FOUND_TEXT } from './not-found.text';
import s from './not-found.module.css';

/** Isi halaman 404: judul besar, kolom pencarian situs, lalu tautan ke Peta Informasi (pola apple.com). */
export function NotFoundContent() {
  return (
    <section className={s.section}>
      <h1 className={s.title}>{NOT_FOUND_TEXT.title}</h1>
      <div className={s.searchBlock}>
        <div className={s.search}>
          <GlobalSearch
            inputProps={{
              placeholder: NOT_FOUND_TEXT.searchPlaceholder,
              'aria-label': NOT_FOUND_TEXT.searchLabel,
              size: 'xl',
              radius: 12,
              leftSection: <IconSearch size={22} stroke={1.6} aria-hidden />,
              leftSectionWidth: 56,
              classNames: { input: s.searchInput, section: s.searchIcon },
            }}
          />
        </div>
        <Link href={PETA_INFORMASI_HREF} className={`${s.sitemap} ${r.trigger}`}>
          <span className={r.cta} data-text={NOT_FOUND_TEXT.sitemapLabel}>
            {NOT_FOUND_TEXT.sitemapLabel}
          </span>
          <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
