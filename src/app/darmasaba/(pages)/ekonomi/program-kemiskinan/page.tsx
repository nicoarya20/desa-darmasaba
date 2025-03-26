import colors from '@/con/colors';
import { Stack, Box, Text, SimpleGrid, Paper } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { LineChart } from '@mantine/charts';

const data = [
  {
    id: 1,
    judul: 'Bantuan Tunai',
    deskripsi: 'Bantuan keuangan langsung bagi keluarga kurang mampu'
  },
  {
    id: 2,
    judul: 'Pelatihan Kerja',
    deskripsi: 'Program pelatihan keterampilan untuk meningkatkan peluang kerja'
  },
  {
    id: 3,
    judul: 'Subsidi Pangan',
    deskripsi: 'Distribusi bahan pangan bersubsidi bagi masyarakat kurang mampu'
  },
  {
    id: 4,
    judul: 'Layanan Kesehatan Gratis',
    deskripsi: 'Akses kesehatan gratis bagi masyarakat kurang mampu'
  },
]
const dataStatistik = [
  {
    id: 1,
    tahun: '2022',
    Kemiskinan: 400000
  },
  {
    id: 2,
    tahun: '2023',
    Kemiskinan: 450000
  },
  {
    id: 3,
    tahun: '2024',
    Kemiskinan: 500000
  },
  {
    id: 4,
    tahun: '2025',
    Kemiskinan: 400000
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
          Program Kemiskinan
        </Text>
        <Text ta={'center'} fz={'h4'}>Berbagai program bantuan untuk mengurangi kemiskinan dan meningkatkan kesejahteraan masyarakat</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 2
            }}
          >
            {data.map((v, k) => {
              return (
                <Paper p={'xl'} key={k}>
                  <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.judul}</Text>
                  <Text fz={'lg'} c={'black'}>{v.deskripsi}</Text>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Paper p={'xl'}>
            <Text fz={'h4'} fw={'bold'} c={colors['blue-button']}>Statistik Kemiskinan Masyarakat</Text>
            <LineChart
              h={300}
              data={dataStatistik}
              dataKey="tahun"
              series={[
                { name: 'Kemiskinan', color: colors['blue-button'] },
              ]}
              curveType="linear"
            />
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
