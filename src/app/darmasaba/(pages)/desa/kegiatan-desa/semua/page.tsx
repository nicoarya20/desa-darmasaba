/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import colors from '@/con/colors';
import { Box, Button, Center, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function Semua() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const kategori = searchParams.get('kategori') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const state = useProxy(stateDashboardKegiatan.kegiatan);
  const loading = state.findMany.loading;
  const items = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  useShallowEffect(() => {
    state.findMany.load(page, 9, search, kategori);
  }, [page, search, kategori]);

  const toDetail = (item: { id: string; kategoriKegiatan?: { nama: string } | null }) =>
    `/darmasaba/desa/kegiatan-desa/${item.kategoriKegiatan?.nama?.toLowerCase() || 'semua'}/${item.id}`;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) params.set('page', newPage.toString());
    else params.delete('page');
    router.replace(`/darmasaba/desa/kegiatan-desa/semua?${params.toString()}`);
  };

  return (
    <Box px={{ base: 'md', md: 100 }} pb="xl">
      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} h={400} radius="lg" />)}
        </SimpleGrid>
      ) : items.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" fz="sm">Belum ada kegiatan desa.</Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {items.map((item) => (
            <Paper key={item.id} shadow="sm" radius="lg" withBorder style={{ overflow: 'hidden' }}>
              {item.image?.link && (
                <Image
                  src={item.image.link}
                  height={220}
                  alt={item.judul}
                  fit="cover"
                  loading="lazy"
                />
              )}
              <Stack p="md" gap="xs">
                <Title order={4} c={colors['blue-button']} ta="center" lineClamp={2}>
                  {item.judul}
                </Title>
                <Text
                  fz="sm"
                  c="dark"
                  ta="justify"
                  lineClamp={3}
                  lh={1.6}
                >
                  {item.deskripsiSingkat}
                </Text>
              </Stack>
              <Center pb="md">
                <Button variant="light" onClick={() => router.push(toDetail(item))}>
                  Detail
                </Button>
              </Center>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      <Center mt="xl">
        <Pagination
          value={page}
          onChange={handlePageChange}
          total={totalPages}
          size="lg"
          radius="xl"
          styles={{
            control: { border: `1px solid ${colors['blue-button']}` },
          }}
        />
      </Center>
    </Box>
  );
}

export default Semua;
