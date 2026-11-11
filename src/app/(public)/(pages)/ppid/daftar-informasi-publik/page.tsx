'use client'

import daftarInformasiPublik from '@/app/admin/(dashboard)/_state/ppid/daftar_informasi_publik/daftarInformasiPublik';
import colors from '@/con/colors';
import { DOKUMEN_PERENCANAAN_PUBLIC_HREF } from '@/lib/dokumen-perencanaan';
import { Pagination, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconChevronRight, IconFileInfo, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { PpidPage } from '../_com/PpidPage';
import { DaftarKontak } from './_com/DaftarKontak';
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
    <TextInput
      type="search"
      radius="xl"
      size="md"
      aria-label={DAFTAR_TEXT.searchLabel}
      placeholder={DAFTAR_TEXT.searchPlaceholder}
      leftSection={<IconSearch size={18} aria-hidden />}
      value={search}
      onChange={(event) => setSearch(event.currentTarget.value)}
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
          <Link href={DOKUMEN_PERENCANAAN_PUBLIC_HREF} className={s.noteLink}>
            {DAFTAR_TEXT.perencanaanLink}
            <IconChevronRight size={16} stroke={2} aria-hidden />
          </Link>
        </p>

        {list}

        {data && totalPages > 1 ? (
          <div className={s.pagination}>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage, DAFTAR_PAGE_SIZE, search)}
              total={totalPages}
              radius="xl"
              size="md"
              color={colors['blue-button']}
              aria-label={DAFTAR_TEXT.paginationLabel}
            />
          </div>
        ) : null}

        <DaftarKontak />
      </div>
    </PpidPage>
  );
}

export default Page;
