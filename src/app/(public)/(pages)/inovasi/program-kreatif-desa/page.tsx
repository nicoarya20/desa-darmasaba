'use client'
import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
import colors from '@/con/colors';
import { Box, Button, Center, Grid, GridCol, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

// const data = [
//   {
//     id: 1,
//     icon: <IconLeaf size={50} color={colors['blue-button']} />,
//     judul: 'Ekowisata dan Desa Hijau',
//     deskripsi: 'Inisiatif ramah lingkungan untuk desa berkelanjutan'
//   },
//   {
//     id: 2,
//     icon: <IconTrophy size={50} color={colors['blue-button']} />,
//     judul: 'Kompetisi dan Festival Desa',
//     deskripsi: 'Ajang kompetisi inovasi dan festival tahunan desa'
//   },
//   {
//     id: 3,
//     icon: <IconBuildingCircus size={50} color={colors['blue-button']} />,
//     judul: 'Wisata Kreatif dan Budaya',
//     deskripsi: 'Promosi destinasi wisata berbasis budaya dan alam'
//   },
//   {
//     id: 4,
//     icon: <IconChartLine size={50} color={colors['blue-button']} />,
//     judul: 'Ekonomi Kreatif',
//     deskripsi: 'Mendukung pelaku UMKM dengan platform digital untuk mempromosikan produk lokal ke pasar global'
//   },
//   {
//     id: 5,
//     icon: <IconRecycle size={50} color={colors['blue-button']} />,
//     judul: 'Smart Waste Management',
//     deskripsi: 'Inisiatif pengelolaan sampah berbasis teknologi untuk menciptakan lingkungan yang bersih dan berkelanjutan.'
//   },
// ]
function Page() {
  const listState = useProxy(programKreatifState);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const router = useTransitionRouter()
  const {
    data,
    loading,
    page,
    totalPages,
    load
  } = listState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={650} radius="md" />
      </Stack>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Grid align='center'>
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Program Kreatif Desa
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Program Kreatif'
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
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
            }}
          >
            {filteredData.map((v, k) => {
              return (
                <Stack key={k}>
                  <Paper p={'xl'} flex={1} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Center pb={20}>
                      {v.icon ? (
                        <IconMapper
                          name={v.icon as IconKey}
                          size={32}
                          color={colors['blue-button']}
                        />
                      ) : (
                        <Text fz="sm" c="dimmed">Tidak ada ikon</Text>
                      )}
                    </Center>
                    <Text ta={'center'} fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.name}</Text>
                    <Text lineClamp={2} lh={"1.9"} py={10} mih={88} ta={'center'} fz={'lg'} c={'black'}>{v.slug}</Text>
                    <Center mt="auto">
                      <Button onClick={() => router.push(`/inovasi/program-kreatif-desa/${v.id}`)} bg={colors['blue-button']}>Selengkapnya</Button>
                    </Center>
                  </Paper>
                </Stack>
              )
            })}
          </SimpleGrid>
        </Stack>
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            mt="md"
            mb="md"
            color="blue"
            radius="md"
          />
        </Center>
      </Box>
    </Stack>
  );
}

export default Page;
