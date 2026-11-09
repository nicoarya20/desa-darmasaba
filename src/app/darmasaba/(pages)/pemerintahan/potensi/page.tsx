/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { Box, Stack, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../layanan/_com/BackButto';
import { PotensiDetailModal } from './_com/PotensiDetailModal';
import { PotensiGrid } from './_com/PotensiGrid';
import { PotensiHeader } from './_com/PotensiHeader';
import {
  POTENSI_LIST_LIMIT,
  countByFilter,
  filterPotensi,
  type PotensiFilter,
  type PotensiItem,
} from './_com/potensi.logic';
import { POTENSI_BRAND_VARS } from './_com/potensi.meta';
import { POTENSI_TEXT } from './_com/potensi.text';

function Page() {
  const [loading, setLoading] = useState(false)
  // Item dipertahankan saat overlay ditutup agar isinya tidak hilang selama animasi keluar.
  const [selected, setSelected] = useState<PotensiItem | null>(null)
  const [detailOpened, setDetailOpened] = useState(false)
  const [filter, setFilter] = useState<PotensiFilter>('semua')
  const state = useProxy(potensiDesaState)

  const openDetail = (item: PotensiItem) => {
    setSelected(item)
    setDetailOpened(true)
  }

  useEffect(() => {
    state.kategoriPotensi.findMany.load()
    const loadData = async () => {
      try {
        setLoading(true)
        await state.potensiDesa.findMany.load(1, POTENSI_LIST_LIMIT)
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.potensiDesa.findMany.data
  // data null = belum pernah dimuat; tampilkan kerangka, bukan pesan kosong, sebelum efek pertama jalan.
  const isLoading = loading || data === null
  const items = useMemo(() => (data ?? []) as PotensiItem[], [data])
  const counts = useMemo(() => (isLoading ? null : countByFilter(items)), [isLoading, items])
  const visible = useMemo(() => filterPotensi(items, filter), [items, filter])

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={48} style={POTENSI_BRAND_VARS}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <PotensiHeader filter={filter} counts={counts} onFilter={setFilter} />

        {!isLoading && items.length === 0 ? (
          <Stack align="center" gap="xs" py={48}>
            <Text fz={{ base: 14, md: 16 }} fw={600} c="dimmed">
              {POTENSI_TEXT.empty}
            </Text>
            <Text fz={{ base: 12, md: 14 }} c="dimmed">
              {POTENSI_TEXT.emptyHint}
            </Text>
          </Stack>
        ) : !isLoading && visible.length === 0 ? (
          <Text ta="center" py={48} fz={{ base: 14, md: 16 }} c="dimmed" role="status">
            {POTENSI_TEXT.emptyFilter(POTENSI_TEXT.filters[filter])}
          </Text>
        ) : (
          <PotensiGrid items={visible} loading={isLoading} onOpen={openDetail} />
        )}
      </Box>

      <PotensiDetailModal item={selected} opened={detailOpened} onClose={() => setDetailOpened(false)} />
    </Stack>
  );
}

export default Page;
