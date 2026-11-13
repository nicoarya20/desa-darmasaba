'use client'
import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import { Box, Center, Pagination, SegmentedControl } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { DaftarPanel } from '../DaftarPanel';
import { PegawaiTable } from '../PegawaiTable';
import { isActiveDari, type StatusFilter } from '../struktur-admin.logic';
import { PEGAWAI_PAGE_SIZE, type StrukturAdminConfig } from '../struktur-admin.config';
import { STRUKTUR_ADMIN_TEXT as TA } from '../struktur-admin.text';

/** Jeda pencarian sebelum memuat ulang daftar (ms). */
const SEARCH_DEBOUNCE_MS = 500;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'semua', label: TA.filter.semua },
  { value: 'aktif', label: TA.filter.aktif },
  { value: 'nonaktif', label: TA.filter.nonaktif },
];

/** Tab Pegawai: daftar pegawai berpaginasi + cari + filter status. */
export function PegawaiListPage({ config }: { config: StrukturAdminConfig }) {
  const { state, routes: R, text: T } = config;
  const router = useRouter();
  const list = useSnapshot(state.pegawai.findMany);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('semua');
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    void state.pegawai.findMany.load(1, PEGAWAI_PAGE_SIZE, debouncedSearch, isActiveDari(filter));
  }, [state, debouncedSearch, filter]);

  const gantiHalaman = (page: number) => {
    void state.pegawai.findMany.load(page, PEGAWAI_PAGE_SIZE, debouncedSearch, isActiveDari(filter));
    window.scrollTo(0, 0);
  };

  const items = list.data ?? [];
  const kosong = search.trim() ? TA.pegawai.tidakDitemukan : TA.pegawai.kosong;

  return (
    <Box>
      <HeaderSearch
        title={T.pegawai.searchTitle}
        placeholder={T.pegawai.searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <DaftarPanel
        title={T.pegawai.listTitle}
        onAdd={() => router.push(R.pegawaiCreate)}
        loading={list.loading && !list.data}
        emptyText={items.length === 0 ? kosong : null}
        toolbar={
          <SegmentedControl
            mb="md"
            aria-label={TA.filter.label}
            data={FILTERS}
            value={filter}
            onChange={(value) => setFilter(value as StatusFilter)}
          />
        }
      >
        <PegawaiTable items={items} onDetail={(id) => router.push(R.pegawaiDetail(id))} />
        {list.totalPages > 1 ? (
          <Center mt="xl">
            <Pagination value={list.page} onChange={gantiHalaman} total={list.totalPages} withEdges radius="md" />
          </Center>
        ) : null}
      </DaftarPanel>
    </Box>
  );
}
