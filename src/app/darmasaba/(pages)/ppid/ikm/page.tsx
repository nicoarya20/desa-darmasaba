import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Center, Flex, ColorSwatch, } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart, DonutChart } from '@mantine/charts';

const dataBar = [
  { pelayanan: 'Persyaratan', kepuasan: 90 },
  { pelayanan: 'Prosedur', kepuasan: 98 },
  { pelayanan: 'Kecepatan', kepuasan: 92 },
  { pelayanan: 'Biaya / Tarif', kepuasan: 85 },
  { pelayanan: 'Produk Layanan', kepuasan: 89 },
  { pelayanan: 'Kompetensi Pelaksana', kepuasan: 91 },
  { pelayanan: 'Perilaku Pelaksana', kepuasan: 90 },
  { pelayanan: 'Penanganan Pengaduan', kepuasan: 93 },
  { pelayanan: 'Sarana dan Prasarana', kepuasan: 91 },
]
const dataJenisKelamin = [
  { name: 'Perempuan', value: 90, color: '#3291CB' },
  { name: 'Laki - Laki', value: 10, color: colors['blue-button'] },
]
const dataResponden = [
  { name: 'Sangat Baik', value: 60, color: 'green' },
  { name: 'Baik', value: 20, color: 'blue' },
  { name: 'Kurang Baik', value: 10, color: 'orange' },
  { name: 'Tidak Baik', value: 10, color: 'red' },

]
const dataUmur = [
  { name: '17 - 25 tahun', value: 60, color: 'green' },
  { name: '26 - 45 tahun', value: 20, color: 'blue' },
  { name: '46 - 60 tahun', value: 10, color: 'orange' },
  { name: 'di atas 60 tahun', value: 10, color: 'red' },

]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Text ta={"center"} fz={{ base: "h2", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Indeks Kepuasan Masyarakat (IKM)
        </Text>
        <Text ta={"center"} fz={{ base: "h2", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Desa Darmasaba
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>
            Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik
          </Text>
          <BarChart
            py={30}
            h={500}
            data={dataBar}
            dataKey='pelayanan'
            orientation='vertical'
            yAxisProps={{ width: 80 }}
            barProps={{ radius: 10 }}
            series={[{ name: 'kepuasan', color: colors['blue-button'] }]}
          />
        </Paper>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>
            Grafik Berdasarkan Jenis Kelamin Responden
          </Text>
          <Center>
            <DonutChart size={250} thickness={30} withLabelsLine labelsType="percent" withLabels data={dataJenisKelamin} />
          </Center>
          <Flex gap={"md"} justify={"center"} align={"center"}>
            <Box>
              <Flex gap={10} align={"center"}>
                <Text>Perempuan</Text>
                <ColorSwatch color='#3291CB' />
              </Flex>
            </Box>
            <Box>
              <Flex gap={10} align={"center"}>
                <Text>Laki - Laki</Text>
                <ColorSwatch color={colors['blue-button']} />
              </Flex>
            </Box>
          </Flex>
        </Paper>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>
            Grafik Berdasarkan Pilihan Responden
          </Text>
          <Center>
            <DonutChart size={250} thickness={30} withLabelsLine labelsType="percent" withLabels data={dataResponden} />
          </Center>
          <Flex gap={"md"} justify={"center"} align={"center"}>
            <Box>
              <Flex gap={{ base: 5, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>Sangat Baik</Text>
                <ColorSwatch color='#40BE57' />
              </Flex>
            </Box>
            <Box>
              <Flex gap={{ base: 5, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>Baik</Text>
                <ColorSwatch color={'#228AE7'} />
              </Flex>
            </Box>
            <Box>
              <Flex gap={{ base: 5, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>Kurang Baik</Text>
                <ColorSwatch color={'#FD7F12'} />
              </Flex>
            </Box>
            <Box>
              <Flex gap={{ base: 5, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>Tidak Baik</Text>
                <ColorSwatch color={'#F85253'} />
              </Flex>
            </Box>
          </Flex>
        </Paper>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Paper p={"xl"} bg={colors['white-trans-1']}>
          <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>
            Grafik Berdasarkan Umur Responden
          </Text>
          <Center>
            <DonutChart size={250} thickness={30} withLabelsLine labelsType="percent" withLabels data={dataUmur} />
          </Center>
          <Flex gap={"md"} justify={"center"} align={"center"}>
            <Box>
              <Flex gap={{ base: 0, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>17 – 25 tahun</Text>
                <ColorSwatch color='#40BE57' />
              </Flex>
            </Box>
            <Box>
              <Flex gap={{ base: 0, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>26 – 45 tahun</Text>
                <ColorSwatch color={'#228AE7'} />
              </Flex>
            </Box>
            <Box>
              <Flex gap={{ base: 0, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>46 – 60 tahun</Text>
                <ColorSwatch color={'#FD7F12'} />
              </Flex>
            </Box>
            <Box>
              <Flex gap={{ base: 0, md: 10 }} align={"center"}>
                <Text fz={{ base: 'xs', md: 'lg' }}>di atas 60 tahun</Text>
                <ColorSwatch color={'#F85253'} />
              </Flex>
            </Box>
          </Flex>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
