import colors from '@/con/colors';
import { Stack, Box, Text, SimpleGrid, Paper, Center, Button } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconBuildingCircus, IconChartLine, IconLeaf, IconRecycle, IconTrophy } from '@tabler/icons-react';

const data = [
  {
    id: 1,
    icon: <IconLeaf size={50} color={colors['blue-button']} />,
    judul: 'Ekowisata dan Desa Hijau',
    deskripsi: 'Inisiatif ramah lingkungan untuk desa berkelanjutan'
  },
  {
    id: 2,
    icon: <IconTrophy size={50} color={colors['blue-button']} />,
    judul: 'Kompetisi dan Festival Desa',
    deskripsi: 'Ajang kompetisi inovasi dan festival tahunan desa'
  },
  {
    id: 3,
    icon: <IconBuildingCircus size={50} color={colors['blue-button']} />,
    judul: 'Wisata Kreatif dan Budaya',
    deskripsi: 'Promosi destinasi wisata berbasis budaya dan alam'
  },
  {
    id: 4,
    icon: <IconChartLine size={50} color={colors['blue-button']} />,
    judul: 'Ekonomi Kreatif',
    deskripsi: 'Mendukung pelaku UMKM dengan platform digital untuk mempromosikan produk lokal ke pasar global'
  },
  {
    id: 5,
    icon: <IconRecycle size={50} color={colors['blue-button']} />,
    judul: 'Smart Waste Management',
    deskripsi: 'Inisiatif pengelolaan sampah berbasis teknologi untuk menciptakan lingkungan yang bersih dan berkelanjutan.'
  },
]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Program Kreatif Desa
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
            }}
          >
            {data.map((v, k) => {
              return (
                <Stack key={k} >
                  <Paper p={'xl'} >
                    <Center pb={20}>
                      {v.icon}
                    </Center>
                    <Text ta={'center'} fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.judul}</Text>
                    <Text py={10} ta={'center'} fz={'lg'} c={'black'}>{v.deskripsi}</Text>
                    <Center>
                      <Button bg={colors['blue-button']}>Selengkapnya</Button>
                    </Center>
                  </Paper>
                </Stack>
              )
            })}
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
