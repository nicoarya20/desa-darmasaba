'use client';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import colors from '@/con/colors';
import { daftarTahunAgenda, tahunBerjalan } from '@/lib/agenda-desa-waktu';
import { Box, Center, Group, Pagination, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { AgendaCard } from './_com/agenda-card';
import { AgendaFilter, type AgendaFilterValue } from './_com/agenda-filter';
import { RingkasanBulan } from './_com/ringkasan-bulan';

const LIMIT = 5;

/** Halaman publik "Agenda & Kalender Desa" (route lama /desa/event-budaya tetap dipakai). */
function AgendaKalenderDesaPage() {
  const state = useProxy(eventBudayaState);
  const { data, loading, page, totalPages, ringkasanBulan } = state.findMany;
  const now = useMemo(() => new Date(), []);
  const tahunOptions = useMemo(() => daftarTahunAgenda(now), [now]);
  const [filter, setFilter] = useState<AgendaFilterValue>({
    tahun: tahunBerjalan(now),
    bulan: null,
    kategori: null,
  });

  const muat = (p: number, f: AgendaFilterValue) =>
    state.findMany.load(p, LIMIT, '', {
      kategori: f.kategori ?? undefined,
      tahun: f.tahun ?? undefined,
      bulan: f.bulan ?? undefined,
    });

  useEffect(() => {
    muat(1, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muat hanya membungkus state global yang stabil
  }, [filter]);

  return (
    <Box px={{ base: 'md', md: 100 }} pb="xl">
      <Title order={2} mb="xs" c={colors['blue-button']}>
        Agenda & Kalender Desa
      </Title>
      <Text c="dimmed" fz="sm" mb="lg">
        Agenda tahunan dan jadwal kegiatan Desa Darmasaba: budaya, pemerintahan, musyawarah, dan lainnya.
      </Text>

      <AgendaFilter value={filter} tahunOptions={tahunOptions} onChange={setFilter} />

      {filter.tahun && ringkasanBulan && (
        <RingkasanBulan
          tahun={filter.tahun}
          jumlah={ringkasanBulan}
          bulanAktif={filter.bulan}
          onPilih={(bulan) => setFilter({ ...filter, bulan })}
        />
      )}

      {loading || !data ? (
        <Stack gap="md">
          {Array(LIMIT)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} h={110} radius="lg" />
            ))}
        </Stack>
      ) : data.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="xs">
            <IconCalendarEvent size={48} color={colors['blue-button-3']} />
            <Text c="dimmed" fz="sm" ta="center">
              Belum ada agenda untuk filter yang dipilih.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {data.map((item) => (
            <AgendaCard key={item.id} item={item} now={now} />
          ))}

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={page}
                onChange={(p) => muat(p, filter)}
                color={colors['blue-button']}
                radius="md"
              />
            </Group>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default AgendaKalenderDesaPage;
