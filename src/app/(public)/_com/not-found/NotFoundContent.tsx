'use client';

import { IconSearch } from '@tabler/icons-react';
import GlobalSearch from '../globalSearch';
import { NOT_FOUND_TEXT } from './not-found.text';
import s from './not-found.module.css';

/** Isi halaman 404: judul besar + kolom pencarian situs (pola apple.com). */
export function NotFoundContent() {
  return (
    <section className={s.section}>
      <h1 className={s.title}>{NOT_FOUND_TEXT.title}</h1>
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
    </section>
  );
}
