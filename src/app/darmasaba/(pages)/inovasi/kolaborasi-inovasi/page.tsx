'use client'
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';
import mitraKolaborasi from '@/app/admin/(dashboard)/_state/inovasi/mitra-kolaborasi';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Grid,
  GridCol,
  Group,
  Image,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const kolabState = useProxy(kolaborasiInovasiState)
  const mitraState = useProxy(mitraKolaborasi)

  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Get unique years from kolaborasiInovasi data
  const years = Array.from(
    new Set(
      kolabState.findMany.data?.map(item => 
        new Date(item.createdAt).getFullYear().toString()
      ) || []
    )
  )
  .sort((a, b) => b.localeCompare(a))
  .map(year => ({ value: year, label: year }));

  const { data, page, totalPages, loading, load } = kolabState.findMany;

  useShallowEffect(() => {
    mitraState.findMany.load(page, 10);
    load(page, 10, search, selectedYear ? `year:${selectedYear}` : '');
  }, [page, search, selectedYear]);

  const mitraData = mitraState.findMany.data || [];
  const mitraLoading = mitraState.findMany.loading;


  return (
    <>
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>

        {/* Header Kolaborasi Inovasi */}
        <Box px={{ base: 'md', md: 100 }} >
          <Grid align='center'>
            <GridCol span={{ base: 12, md: 9 }}>
              <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
                Kolaborasi Inovasi
              </Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 3 }}>
              <TextInput
                radius="lg"
                placeholder='Cari Kolaborasi Inovasi'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftSection={<IconSearch size={20} />}
                w={{ base: "50%", md: "100%" }}
              />
            </GridCol>
          </Grid>
        </Box>

        {/* Filter Tahun */}
        <Box px={{ base: "md", md: 100 }}>
          <Stack gap="lg" justify="center">
            <Group justify="flex-end">
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                label={<Text fw="bold" fz="sm">Tahun</Text>}
                placeholder='Semua Tahun'
                clearable
                data={[{ value: '', label: 'Semua Tahun' }, ...years]}
              />
            </Group>

            {/* List Kolaborasi Inovasi */}
            {loading || !data ? (
              <Stack py={10}>
                <Skeleton height={650} />
              </Stack>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {data.map((v, k) => (
                  <Paper p="xl" key={k}>
                    <Text fz="h3" fw="bold" c={colors['blue-button']}>{v.name}</Text>
                    <Box pr="lg" pb={20}>{v.slug}</Box>
                    <Box pr="lg">{v.kolaborator}</Box>
                  </Paper>
                ))}
              </SimpleGrid>
            )}

            {/* Pagination */}
            <Center>
              <Pagination
                value={page}
                onChange={(newPage) => load(newPage)}
                total={totalPages}
                mt="md"
                mb="md"
              />
            </Center>
          </Stack>
        </Box>
      </Stack>

      {/* Mitra Kolaborasi Section */}
      <Box py={40} px={{ base: "md", md: 100 }} bg={colors['white-trans-1']}>
        <Stack gap="lg" justify="center">
          <Box px={{ base: 'md', md: 100 }}>
            <Text ta="center" fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
              Mitra Kolaborasi
            </Text>
            <Text ta="center" fz="h4">
              Kami berkolaborasi dengan berbagai mitra dari berbagai sektor untuk mewujudkan visi Smart Village Darmasaba.
            </Text>
          </Box>

          {mitraLoading ? (
            <Center py={20}><Skeleton height={100} width="80%" /></Center>
          ) : (
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl">
              {mitraData.map((m) => (
                <Paper key={m.id} p="md" shadow="sm" radius="md">
                  <Center mb="sm">
                    {m.image?.link ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}${m.image.link}`}
                        alt={m.name}
                        w={150}
                        h={100}
                        fit="cover"
                        radius="md"
                      />
                    ) : (
                      <Box w={100} h={100} bg={colors['blue-button']} style={{ borderRadius: '50%' }} />
                    )}
                  </Center>
                  <Text ta="center" fw="bold">{m.name}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Box>
    </>
  );
}

export default Page;
