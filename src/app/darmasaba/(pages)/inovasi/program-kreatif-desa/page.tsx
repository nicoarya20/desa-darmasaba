'use client'
import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useTransitionRouter } from 'next-view-transitions';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconSearch } from '@tabler/icons-react';
import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';

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
  const [debouncedSearch] = useDebouncedValue(search, 500);
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
        <Group justify="space-between" mb="md" align='center'>
          <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Program Kreatif Desa
          </Text>
          <TextInput
            placeholder="Cari program kreatif..."
            leftSection={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Group>
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
                <Stack key={k} >
                  <Paper p={'xl'} >
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
                    <Text py={10} ta={'center'} fz={'lg'} c={'black'}>{v.slug}</Text>
                    <Center>
                      <Button onClick={() => router.push(`/darmasaba/inovasi/program-kreatif-desa/${v.id}`)} bg={colors['blue-button']}>Selengkapnya</Button>
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
