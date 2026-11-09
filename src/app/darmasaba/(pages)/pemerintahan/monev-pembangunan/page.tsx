'use client'
import stateMonevPembangunan from '@/app/admin/(dashboard)/_state/desa/monevPembangunan';
import colors from '@/con/colors';
import {
  STATUS_PEMBANGUNAN,
  STATUS_PEMBANGUNAN_LABEL,
} from '@/lib/kegiatan-pembangunan';
import { buildRkpIndex } from '@/lib/dokumen-perencanaan';
import stateDokumenPerencanaanPublik from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaanPublik';
import { Alert, Button, Center, Group, Pagination, Paper, ScrollArea, SegmentedControl, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconChartBar } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../layanan/_com/BackButto';
import DokumenPerencanaanSection from './_com/DokumenPerencanaanSection';
import MonevKegiatanList from './_com/MonevKegiatanList';
import MonevSummaryCards from './_com/MonevSummaryCards';

const APBDES_HREF = '/darmasaba/apbdes';
const FILTER_ALL = 'semua';
const filterOptions = [
  { value: FILTER_ALL, label: 'Semua' },
  ...STATUS_PEMBANGUNAN.map((s) => ({ value: s, label: STATUS_PEMBANGUNAN_LABEL[s] })),
];

/** Halaman publik Monev & Pembangunan: ringkasan, daftar progres, dan tautan ke realisasi APBDes. */
function Page() {
  const state = useProxy(stateMonevPembangunan);
  const [filter, setFilter] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);

  const loadCurrent = () => stateMonevPembangunan.load(page, filter === FILTER_ALL ? '' : filter);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadCurrent dibuat ulang tiap render; dependensi sebenarnya page & filter
  useEffect(() => { loadCurrent(); }, [page, filter]);

  const summary = state.summary;

  const dokumenState = useProxy(stateDokumenPerencanaanPublik);
  useEffect(() => { stateDokumenPerencanaanPublik.loadRkpIndex(); }, []);
  const rkpIndex = useMemo(() => buildRkpIndex(dokumenState.rkpDocs), [dokumenState.rkpDocs]);

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl" px={{ base: 'md', md: 100 }}>
      <BackButton />

      <Stack gap={4}>
        <Text fz={{ base: '2rem', md: '3.4rem' }} c={colors['blue-button']} fw="bold" lh={1.2}>
          Monev &amp; Pembangunan
        </Text>
        <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
          Pantau progres kegiatan pembangunan Desa Darmasaba beserta anggarannya.
        </Text>
      </Stack>

      {state.failed && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} title="Gagal memuat data">
          <Group justify="space-between">
            <Text fz="sm">Data monev belum dapat ditampilkan.</Text>
            <Button size="compact-sm" variant="light" color="red" onClick={loadCurrent}>
              Coba lagi
            </Button>
          </Group>
        </Alert>
      )}

      {summary ? <MonevSummaryCards summary={summary} /> : !state.failed && <Skeleton h={110} radius="lg" />}

      <Paper withBorder radius="lg" p="md" bg="blue.0">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="sm" wrap="nowrap">
            <IconChartBar size={22} color={colors['blue-button']} />
            <Text fz="sm">Lihat realisasi anggaran desa secara lengkap di halaman APBDes.</Text>
          </Group>
          <Button component={Link} href={APBDES_HREF} variant="filled" radius="md" size="compact-md">
            Buka Realisasi APBDes
          </Button>
        </Group>
      </Paper>

      <Stack gap="md">
        <ScrollArea type="never">
          <SegmentedControl
            data={filterOptions}
            value={filter}
            onChange={(value) => { setFilter(value); setPage(1); }}
            radius="lg"
          />
        </ScrollArea>
        <MonevKegiatanList items={state.data} loading={state.loading} filtered={filter !== FILTER_ALL} rkpIndex={rkpIndex} />
        {state.totalPages > 1 && (
          <Center>
            <Pagination value={page} onChange={setPage} total={state.totalPages} radius="xl" />
          </Center>
        )}
      </Stack>

      <DokumenPerencanaanSection />
    </Stack>
  );
}

export default Page;
