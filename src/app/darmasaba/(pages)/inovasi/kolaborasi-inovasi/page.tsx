'use client'
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Group, Image, Pagination, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
function Page() {
  const state = useProxy(kolaborasiInovasiState)
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Get unique years from the data
  const years = Array.from(
    new Set(
      state.findMany.data?.map(item => 
        new Date(item.createdAt).getFullYear().toString()
      ) || []
    )
  )
  .sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)
  .map(year => ({
    value: year,
    label: year,
  }));

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany

  useShallowEffect(() => {
    load(page, 10, search, selectedYear || '')
  }, [page, search, selectedYear])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={650} />
      </Stack>
    );
  }

  return (
    <>
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box px={{ base: 'md', md: 100 }} >
          <Grid align='center'>
            <GridCol span={{ base: 12, md: 9 }}>
              <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
                Kolaborasi Inovasi
              </Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 3 }}>
              <TextInput
                radius={"lg"}
                placeholder='Cari Kolaborasi Inovasi'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftSection={<IconSearch size={20} />}
                w={{ base: "50%", md: "100%" }}
              />
            </GridCol>
          </Grid>
        </Box>
        <Box px={{ base: "md", md: 100 }}>
          <Stack gap={'lg'} justify='center'>
            <Group justify='flex-end'>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                label={<Text fw={"bold"} fz={"sm"}>Tahun</Text>}
                placeholder='Semua Tahun'
                clearable
                data={[
                  { value: '', label: 'Semua Tahun' },
                  ...years
                ]}
              />
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={'lg'}>
              {data.map((v, k) => {
                return (
                  <Paper p={'xl'} key={k}>
                    <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.name}</Text>
                    <Box pr={'lg'} pb={20}>
                      {v.slug}
                    </Box>
                    <Box pr={'lg'}>
                      {v.kolaborator}
                    </Box>
                  </Paper>
                );
              })}
            </SimpleGrid>
            <Center>
              <Pagination
                value={page}
                onChange={(newPage) => load(newPage)} // ini penting!
                total={totalPages}
                mt="md"
                mb="md"
              />
            </Center>
          </Stack>
        </Box>
      </Stack>
      <Box py={40} px={{ base: "md", md: 100 }} bg={colors['white-trans-1']}>
        <Stack gap={'lg'} justify='center'>
          <Box px={{ base: 'md', md: 100 }} >
            <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Mitra Kolaborasi
            </Text>
            <Text ta={'center'} fz={'h4'}>Kami berkolaborasi dengan berbagai mitra dari berbagai sektor untuk mewujudkan visi Smart Village Darmasaba.</Text>
          </Box>
          <Center>
            <Image src={'/api/img/logoukm-kolaborasiinvoasi.png'} alt='' w={{ base: 500, md: 650 }} />
          </Center>
        </Stack>
      </Box>
    </>
  );
}

export default Page;
