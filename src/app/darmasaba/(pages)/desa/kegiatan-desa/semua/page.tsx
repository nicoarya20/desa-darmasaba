/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { KegiatanCard } from '../_com/KegiatanCard';
import { IconArrowRight, IconCalendar, IconMapPin, IconUsers } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

const formatTanggal = (val: string) =>
  val
    ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

function Semua() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const state = useProxy(stateDashboardKegiatan.kegiatan);
  const loading = state.findMany.loading;
  const items = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  useEffect(() => {
    state.findMany.load(page, 7, search);
  }, [page, search]);

  const handlePageChange = (newPage: number) => {
    const url = new URLSearchParams(searchParams.toString());
    if (search) url.set('search', search);
    if (newPage > 1) url.set('page', newPage.toString());
    else url.delete('page');
    router.replace(`?${url.toString()}`);
  };

  const featured = items[0] ?? null;
  const rest = items.slice(1);

  const toDetail = (item: { id: string; kategoriKegiatan?: { nama: string } | null }) =>
    `/darmasaba/desa/kegiatan-desa/${item.kategoriKegiatan?.nama?.toLowerCase() || 'semua'}/${item.id}`;

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: 'md', md: 'xl' }}>

        {/* ─── Hero / Kegiatan Utama ─── */}
        {loading ? (
          <Center><Skeleton h={380} radius="md" /></Center>
        ) : featured ? (
          <Box mb={50}>
            <Title order={2} mb="md" c="dark">Kegiatan Terbaru</Title>
            <Paper shadow="md" radius="lg" withBorder style={{ overflow: 'hidden' }}>
              <Grid gutter={0}>
                <GridCol span={{ base: 12, md: 6 }}>
                  <Image
                    src={featured.image?.link || '/images/placeholderx.jpg'}
                    alt={featured.judul || 'Kegiatan Utama'}
                    height={380}
                    fit="cover"
                    style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0 }}
                    loading="lazy"
                  />
                </GridCol>
                <GridCol span={{ base: 12, md: 6 }} p="xl">
                  <Stack h="100%" justify="space-between" gap="md">
                    <Stack gap="sm">
                      <Badge color={colors['blue-button']} variant="light" size="md" radius="md">
                        {featured.kategoriKegiatan?.nama || 'Kegiatan'}
                      </Badge>
                      <Title order={3} lh={1.3} lineClamp={2}>
                        {featured.judul}
                      </Title>
                      <Text c="dimmed" lineClamp={3} fz={{ base: 'sm', md: 'md' }} lh={1.6}>
                        {featured.deskripsiSingkat}
                      </Text>
                    </Stack>

                    <Stack gap="xs">
                      <Group gap="xs" wrap="nowrap">
                        <IconCalendar size={16} color={colors['blue-button']} />
                        <Text fz="sm" c="dimmed">{formatTanggal(featured.tanggal)}</Text>
                      </Group>
                      <Group gap="xs" wrap="nowrap">
                        <IconMapPin size={16} color={colors['blue-button']} />
                        <Text fz="sm" c="dimmed" lineClamp={1}>{featured.lokasi || '-'}</Text>
                      </Group>
                      <Group gap="xs" wrap="nowrap">
                        <IconUsers size={16} color={colors['blue-button']} />
                        <Text fz="sm" c="dimmed">{featured.partisipan ?? 0} partisipan</Text>
                      </Group>
                    </Stack>

                    <Button
                      variant="light"
                      color={colors['blue-button']}
                      rightSection={<IconArrowRight size={16} />}
                      radius="md"
                      onClick={() => router.push(toDetail(featured))}
                    >
                      Lihat Detail
                    </Button>
                  </Stack>
                </GridCol>
              </Grid>
            </Paper>
          </Box>
        ) : null}

        {/* ─── Grid Kegiatan ─── */}
        <Box mt={loading ? 0 : 50}>
          <Title order={2} mb="md" c="dark">Semua Kegiatan</Title>
          <Divider mb="xl" />

          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} h={320} radius="md" />)}
            </SimpleGrid>
          ) : rest.length === 0 && !featured ? (
            <Text c="dimmed" ta="center" fz="sm" py="xl">Belum ada kegiatan desa.</Text>
          ) : rest.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
              {rest.map((item) => (
                <KegiatanCard key={item.id} item={item} onNavigate={() => router.push(toDetail(item))} />
              ))}
            </SimpleGrid>
          ) : null}

          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={page}
              onChange={handlePageChange}
              siblings={1}
              boundaries={1}
              withEdges
              color={colors['blue-button']}
            />
          </Center>
        </Box>
      </Container>
    </Box>
  );
}

export default Semua;
