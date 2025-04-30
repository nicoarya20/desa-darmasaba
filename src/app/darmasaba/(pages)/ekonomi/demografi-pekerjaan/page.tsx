import colors from '@/con/colors';
import { Stack, Box, Paper, Text, ColorSwatch, Flex } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';

const data = [
  {
    id: 1,
    Pekerjaan: 'Guru',
    laki: 2,
    perempuan: 3
  },
  {
    id: 2,
    Pekerjaan: 'Belajar/Mahasiswa',
    laki: 37,
    perempuan: 38
  },
  {
    id: 3,
    Pekerjaan: 'Karyawan Bumdn',
    laki: 1,
    perempuan: 0
  },
  {
    id: 4,
    Pekerjaan: 'Buruh Tani/Perkebunan',
    laki: 1,
    perempuan: 0
  },
  {
    id: 5,
    Pekerjaan: 'Karyawan Swasta',
    laki: 3,
    perempuan: 17
  },
  {
    id: 6,
    Pekerjaan: 'Karyawan Honorer',
    laki: 2,
    perempuan: 1
  },
  {
    id: 7,
    Pekerjaan: 'Buruh Harian Lepas',
    laki: 8,
    perempuan: 5
  },
  {
    id: 8,
    Pekerjaan: 'Belum/Tidak Bekerja',
    laki: 87,
    perempuan: 44
  },
  {
    id: 9,
    Pekerjaan: ' Kepolisian RI (Polri)',
    laki: 4,
    perempuan: 0
  },
  {
    id: 10,
    Pekerjaan: 'Wiraswasta Mengurus Rumah Tangga',
    laki: 1,
    perempuan: 7
  },
  {
    id: 11,
    Pekerjaan: 'Dosen',
    laki: 1,
    perempuan: 1
  },
  {
    id: 12,
    Pekerjaan: 'Perangkat Desa',
    laki: 17,
    perempuan: 19
  },
  {
    id: 13,
    Pekerjaan: 'Nelayan',
    laki: 3,
    perempuan: 0
  },
  {
    id: 14,
    Pekerjaan: 'Penyuluh Pertanian',
    laki: 33,
    perempuan: 24
  },
  {
    id: 15,
    Pekerjaan: 'Tukang Las/Pandai Besi',
    laki: 5,
    perempuan: 0
  },
  {
    id: 16,
    Pekerjaan: 'Sopir/Driver',
    laki: 10,
    perempuan: 3
  },
  {
    id: 17,
    Pekerjaan: 'Teknisi/Listrik',
    laki: 25,
    perempuan: 0
  },
  {
    id: 18,
    Pekerjaan: 'Montir/Mekanik',
    laki: 25,
    perempuan: 0
  },
  {
    id: 19,
    Pekerjaan: 'Karyawan Hotel/Pariwisata',
    laki: 2,
    perempuan: 52
  },
  {
    id: 20,
    Pekerjaan: 'Pengrajin (Batik, Anyaman, Kayu)',
    laki: 5,
    perempuan: 25
  },
  {
    id: 21,
    Pekerjaan: 'Tukang Bangunan',
    laki: 25,
    perempuan: 5
  },
  {
    id: 22,
    Pekerjaan: 'Tukang Kayu/Furnitur',
    laki: 25,
    perempuan: 0
  },
  {
    id: 23,
    Pekerjaan: 'Penjahit',
    laki: 2,
    perempuan: 35
  },
  {
    id: 24,
    Pekerjaan: 'Pedagang Pasar',
    laki: 25,
    perempuan: 30
  },
  {
    id: 25,
    Pekerjaan: 'Warung Makan/Penjual Makanan',
    laki: 15,
    perempuan: 30
  },
  {
    id: 26,
    Pekerjaan: 'Satpam/Security',
    laki: 20,
    perempuan: 5
  },
  {
    id: 27,
    Pekerjaan: 'Pengusaha Kecil (UMKM)',
    laki: 5,
    perempuan: 20
  },
  {
    id: 28,
    Pekerjaan: 'Karyawan Restoran/Kafe',
    laki: 5,
    perempuan: 15
  },
  {
    id: 29,
    Pekerjaan: 'Freelancer',
    laki: 20,
    perempuan: 10
  },
  {
    id: 30,
    Pekerjaan: 'Fotografer',
    laki: 25,
    perempuan: 9
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
          Demografi Pekerjaan
        </Text>
        <Text ta={'center'} fz={'h4'}>Desa Darmasaba memiliki komposisi penduduk yang beragam dalam sektor pekerjaan</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper p={'xl'}>
            <Text fw={'bold'} fz={'h4'}>Statistik Demografi Pekerjaan Di Desa Darmasaba</Text>
            <BarChart
              type='stacked'
              p={10}
              mb={50}
              h={400}
              data={data}
              dataKey="Pekerjaan"
              series={[
                { name: 'laki', color: '#5082EE' },
                { name: 'perempuan', color: '#6EDF9C' },
              ]}
              tickLine="y"
              xAxisProps={{
                angle: -45,  // Rotate labels by -45 degrees
                textAnchor: 'end',  // Anchor text to the end for better alignment
                height: 100,  // Increase height for rotated labels
                interval: 0,  // Show all labels
                style: { 
                  fontSize: '12px',  // Adjust font size if needed
                  overflow: 'visible',
                  whiteSpace: 'nowrap'
                }
              }}
            />
            <Flex pb={30} justify={'center'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Laki-Laki</Text>
                  <ColorSwatch color="#5082EE" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Perempuan</Text>
                  <ColorSwatch color="#6EDF9C" size={30} />
                </Flex>
              </Box>
            </Flex>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
