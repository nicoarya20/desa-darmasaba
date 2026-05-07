'use client'
import cctvState, { CctvData } from '@/app/admin/(dashboard)/_state/keamanan/cctv';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Center,
  Grid,
  GridCol,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconCamera, IconClock, IconMapPin, IconSearch, IconVideo } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

const CctvMapSection = dynamic(() => import('./_com/CctvMapSection'), { ssr: false });

function Page() {
  const state = useProxy(cctvState);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [allCctv, setAllCctv] = useState<CctvData[]>([]);
  const [mapLoading, setMapLoading] = useState(true);

  const { data, page, totalPages, loading } = state.findMany;

  useShallowEffect(() => {
    cctvState.findMany.search = debouncedSearch;
    cctvState.findMany.limit = 9;
    cctvState.findMany.load();
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetch('/api/keamanan/cctv/find-many?limit=200&page=1')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAllCctv(res.data ?? []);
      })
      .catch(() => {})
      .finally(() => setMapLoading(false));
  }, []);

  const markersCount = allCctv.filter((c) => c.latitude != null && c.longitude != null).length;
  const onlineCount = allCctv.filter((c) => c.status === 'Online').length;
  const offlineCount = allCctv.filter((c) => c.status === 'Offline').length;

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* Header */}
      <Box>
        <Grid align="center" px={{ base: 'md', md: 100 }}>
          <GridCol span={{ base: 12, md: 9 }}>
            <Title order={1} c={colors['blue-button']} lh={1.15}>
              CCTV Keamanan Desa
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari kode, nama, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w="100%"
            />
          </GridCol>
        </Grid>
        <Text
          px={{ base: 'md', md: 100 }}
          pt={16}
          ta="justify"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.55}
          c="black"
        >
          Informasi titik-titik CCTV yang terpasang di wilayah Desa Darmasaba untuk mendukung
          keamanan dan ketertiban lingkungan.
        </Text>
      </Box>

      {/* Map Section */}
      <Box px={{ base: 'md', md: 100 }}>
        <Paper withBorder radius="xl" shadow="md">
          {/* Map Legend */}
          <Group px="md" pt="md" pb="xs" justify="space-between" wrap="wrap" gap="xs">
            <Group gap="xs">
              <IconVideo size={18} color={colors['blue-button']} />
              <Text fw={600} fz="sm" c={colors['blue-button']}>
                Peta Titik CCTV
              </Text>
              {markersCount > 0 && (
                <Text fz="xs" c="dimmed">
                  ({markersCount} titik terpetakan)
                </Text>
              )}
            </Group>
            <Group gap="md">
              <Group gap={6}>
                <Box w={12} h={12} style={{ borderRadius: '50%', background: '#2f9e44', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                <Text fz="xs" c="dimmed">Online ({onlineCount})</Text>
              </Group>
              <Group gap={6}>
                <Box w={12} h={12} style={{ borderRadius: '50%', background: '#e03131', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                <Text fz="xs" c="dimmed">Offline ({offlineCount})</Text>
              </Group>
            </Group>
          </Group>

          {/* Map */}
          <Box style={{ height: 420, position: 'relative' }}>
            {mapLoading ? (
              <Skeleton height={420} radius={0} />
            ) : markersCount === 0 ? (
              <Center h={420}>
                <Stack align="center" gap="xs">
                  <IconMapPin size={36} color="gray" opacity={0.4} />
                  <Text c="dimmed" fz="sm">Belum ada titik koordinat CCTV</Text>
                </Stack>
              </Center>
            ) : (
              <CctvMapSection data={allCctv} />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Card Grid */}
      <Box px={{ base: 'md', md: 100 }}>
        {data.length === 0 ? (
          <Center py={60}>
            <Stack align="center" gap="xs">
              <IconCamera size={48} color={colors['blue-button']} opacity={0.4} />
              <Text c="dimmed" fz="sm">Tidak ada data CCTV ditemukan</Text>
            </Stack>
          </Center>
        ) : (
          <Grid gutter="xl">
            {data.map((item) => (
              <GridCol key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Paper
                  radius="xl"
                  shadow="md"
                  withBorder
                  p="lg"
                  bg={colors['white-trans-1']}
                  h="100%"
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Group gap="xs">
                      <IconCamera size={18} color={colors['blue-button']} />
                      <Text fz="sm" fw={700} c={colors['blue-button']}>
                        {item.kode}
                      </Text>
                    </Group>
                    <Badge
                      color={item.status === 'Online' ? 'green' : 'red'}
                      variant="light"
                      radius="sm"
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </Group>

                  <Text fz="md" fw={600} c="dark.8" lh={1.3}>
                    {item.nama}
                  </Text>

                  <Group gap="xs" align="flex-start">
                    <IconMapPin size={15} color="gray" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Text fz="sm" c="dimmed" lh={1.4}>
                      {item.lokasi}
                    </Text>
                  </Group>

                  <Group gap="xs" mt="auto">
                    <IconClock size={13} color="gray" />
                    <Text fz="xs" c="dimmed">
                      {new Date(item.lastActive).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Group>
                </Paper>
              </GridCol>
            ))}
          </Grid>
        )}
      </Box>

      <Center mt="xl">
        <Pagination
          value={page}
          onChange={(newPage) => {
            cctvState.findMany.page = newPage;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          size="lg"
          radius="xl"
          styles={{
            control: {
              border: `1px solid ${colors['blue-button']}`,
            },
          }}
        />
      </Center>
    </Stack>
  );
}

export default Page;
