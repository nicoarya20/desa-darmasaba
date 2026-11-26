'use client'

import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { SearchField } from '@/app/(public)/_com/search-field/SearchField';
import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import { DOKUMEN_PERENCANAAN_PUBLIC_HREF } from '@/lib/dokumen-perencanaan';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconChevronRight, IconFileInfo } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { PpidPage } from '../_com/PpidPage';
import { KontakPpid } from '../_com/KontakPpid';
import { DaftarTable, DaftarTableSkeleton } from './_com/DaftarTable';
import { DAFTAR_PAGE_SIZE, DAFTAR_SEARCH_DEBOUNCE } from './_com/daftar.logic';
import s from './_com/daftar.module.css';
import { DAFTAR_TEXT } from './_com/daftar.text';

/** Halaman publik Daftar Informasi Publik: daftar berhalaman yang bisa dicari + kontak PPID. */
function Page() {
  const listData = useProxy(daftarInformasiPublik)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, DAFTAR_SEARCH_DEBOUNCE);
  const { data, page, totalPages, loading, load } = listData.findMany

  useShallowEffect(() => {
    load(page, DAFTAR_PAGE_SIZE, debouncedSearch)
  }, [page, debouncedSearch])

  const searchBox = (
    <SearchField
      fullWidth
      label={DAFTAR_TEXT.searchLabel}
      placeholder={DAFTAR_TEXT.searchPlaceholder}
      value={search}
      onChange={setSearch}
    />
  )

  let list
  if (!data) {
    list = <DaftarTableSkeleton />
  } else if (data.length === 0) {
    list = (
      <p className={s.empty} role="status">
        <IconFileInfo size={28} stroke={1.5} aria-hidden />
        {DAFTAR_TEXT.empty}
      </p>
    )
  } else {
    list = <DaftarTable items={data} page={page} busy={loading} />
  }

  return (
    <PpidPage title={DAFTAR_TEXT.title} lead={DAFTAR_TEXT.lead} aside={searchBox}>
      <div className={s.body}>
        <p className={s.note}>
          {DAFTAR_TEXT.perencanaanNote}
          <Link href={DOKUMEN_PERENCANAAN_PUBLIC_HREF} className={`${s.noteLink} ${r.trigger}`}>
            <span className={r.cta} data-text={DAFTAR_TEXT.perencanaanLink}>
              {DAFTAR_TEXT.perencanaanLink}
            </span>
            <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
          </Link>
        </p>

        {list}

        {data ? (
          <KabarListPagination
            total={totalPages}
            value={page}
            label={DAFTAR_TEXT.paginationLabel}
            onChange={(newPage) => load(newPage, DAFTAR_PAGE_SIZE, search)}
          />
        ) : null}

        <KontakPpid />
      </div>
    </PpidPage>
  );
}

export default Page;
