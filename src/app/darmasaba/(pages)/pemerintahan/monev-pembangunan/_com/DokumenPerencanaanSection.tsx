'use client'
import stateDokumenPerencanaanPublik from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaanPublik';
import colors from '@/con/colors';
import {
  DOKUMEN_PERENCANAAN_SECTION_ID,
  JENIS_DOKUMEN,
  JENIS_DOKUMEN_LABEL,
  type JenisDokumen,
} from '@/lib/dokumen-perencanaan';
import { Alert, Button, Center, Group, Pagination, ScrollArea, SegmentedControl, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import DokumenPerencanaanCard from './DokumenPerencanaanCard';

const SKELETON_COUNT = 3;
const tabOptions = JENIS_DOKUMEN.map((v) => ({ value: v, label: JENIS_DOKUMEN_LABEL[v] }));

/** Section publik "Dokumen Perencanaan": tab RPJM | RKP | Berita Acara, kartu dokumen, empty-state. */
export default function DokumenPerencanaanSection() {
  const state = useProxy(stateDokumenPerencanaanPublik);
  const [jenis, setJenis] = useState<JenisDokumen>('RPJM');
  const [page, setPage] = useState(1);

  const reload = () => stateDokumenPerencanaanPublik.load(jenis, page);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload dibuat ulang tiap render; dependensi sebenarnya jenis & page
  useEffect(() => { reload(); }, [jenis, page]);

  return (
    <Stack gap="md" id={DOKUMEN_PERENCANAAN_SECTION_ID} style={{ scrollMarginTop: 80 }}>
      <Stack gap={4}>
        <Title order={2} fz={{ base: '1.5rem', md: '2rem' }} c={colors['blue-button']}>
          Dokumen Perencanaan
        </Title>
        <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
          RPJM Desa, RKP Desa, dan berita acara musyawarah sebagai dasar kegiatan pembangunan.
        </Text>
      </Stack>

      <ScrollArea type="never">
        <SegmentedControl
          data={tabOptions}
          value={jenis}
          onChange={(value) => { setJenis(value as JenisDokumen); setPage(1); }}
          radius="lg"
        />
      </ScrollArea>

      {state.failed && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} title="Gagal memuat dokumen">
          <Group justify="space-between">
            <Text fz="sm">Dokumen perencanaan belum dapat ditampilkan.</Text>
            <Button size="compact-sm" variant="light" color="red" onClick={reload}>Coba lagi</Button>
          </Group>
        </Alert>
      )}

      {state.loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => <Skeleton key={i} h={200} radius="lg" />)}
        </SimpleGrid>
      ) : state.data.length === 0 ? (
        !state.failed && (
          <Center py="xl">
            <Text c="dimmed" fz="sm" ta="center">
              Belum ada dokumen {JENIS_DOKUMEN_LABEL[jenis]}. Dokumen akan tampil setelah ditambahkan oleh admin desa.
            </Text>
          </Center>
        )
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {state.data.map((item) => <DokumenPerencanaanCard key={item.id} item={item} />)}
        </SimpleGrid>
      )}

      {state.totalPages > 1 && (
        <Center>
          <Pagination value={page} onChange={setPage} total={state.totalPages} radius="xl" />
        </Center>
      )}
    </Stack>
  );
}
