'use client'
import statePolsekTerdekat from '@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat';
import colors from '@/con/colors';
import { Box, Button, Center, Grid, GridCol, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconNavigation, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(statePolsekTerdekat.polsekTerdekatState);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }}>
        <GridCol span={{ base: 12, md: 9 }}>
          <Title
            order={1}
            c={colors['blue-button']}
            lh={1.2}
          >
            Semua Polsek Terdekat
          </Title>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <TextInput
            radius="lg"
            placeholder="Cari Polsek"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w={{ base: '50%', md: '100%' }}
          />
        </GridCol>
      </Grid>

      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {data.map((v, k) => (
            <Paper p="xl" bg={colors['white-trans-1']} key={k}>
              <Stack gap="xs">
                <Title
                  order={3}
                  fw="bold"
                  lh={1.2}
                >
                  {v.nama}
                </Title>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  Alamat: {v.alamat}
                </Text>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  Jarak: {v.jarakKeDesa}
                </Text>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  Telepon: {v.nomorTelepon}
                </Text>
                <Text fz={{ base: 'sm', md: 'md' }} lh={1.5}>
                  Jam Operasional: {v.jamOperasional}
                </Text>
                <Box pt={20}>
                  <iframe
                    style={{ border: 2, width: '100%' }}
                    src={v.embedMapUrl}
                    width="550"
                    height="300"
                  ></iframe>
                </Box>
                <Box pt={20}>
                  <Button
                    onClick={() => router.push(v.linkPetunjukArah)}
                    fullWidth
                    bg={colors['blue-button']}
                    radius={10}
                    leftSection={<IconNavigation size={20} />}
                  >
                    Petunjuk Arah
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

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
  );
}

export default Page;