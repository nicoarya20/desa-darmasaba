import colors from '@/con/colors';
import { Stack, Box, Text, Paper, Center, Flex, ColorSwatch, SimpleGrid, Anchor, Divider, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';
import Link from 'next/link';


const dataKematian = [
  {
    id: 1,
    tahun: '2023',
    kematianKasar: '1.7',
    kematianBayi: '1.4',
    kelahiranKasar: '0.5'
  },
  {
    id: 2,
    tahun: '2024',
    kematianKasar: '1.4',
    kematianBayi: '1.8',
    kelahiranKasar: '1.5'
  },
  {
    id: 3,
    tahun: '2025',
    kematianKasar: '2.0',
    kematianBayi: '1.5',
    kelahiranKasar: '1.2'
  },

]

const dataPenyakit = [
  { penyakit: 'Covid', penderita: 335 },
  { penyakit: 'Tuli', penderita: 105 },
  { penyakit: 'Bisul', penderita: 98 },
  { penyakit: 'Panas', penderita: 96 },
  { penyakit: 'Batuk', penderita: 87 },
  { penyakit: 'Sembelit', penderita: 72 },
  { penyakit: 'Demam', penderita: 51 },
  { penyakit: 'Gred', penderita: 36 },
  { penyakit: 'Magh', penderita: 34 },
  { penyakit: 'Farangitis Akut', penderita: 17 },
]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
        Data Kesehatan Masyarakat Puskesmas Darmasaba
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          {/* Bar Chart Kematian Kelahiran */}
          <Box>
            <Paper p={"xl"} bg={colors['white-trans-1']}>
              <Box pb={30}>
                <Flex pb={30} justify={'flex-end'} gap={'xl'} align={'center'}>
                  <Box>
                    <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                      <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Angka Kematian Kasar</Text>
                      <ColorSwatch color="#26308A" size={30} />
                    </Flex>
                  </Box>
                  <Box>
                    <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                      <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Angka Kematian Bayi</Text>
                      <ColorSwatch color="#135A9B" size={30} />
                    </Flex>
                  </Box>
                  <Box>
                    <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                      <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Angka Kelahiran Kasar</Text>
                      <ColorSwatch color="#3290CA" size={30} />
                    </Flex>
                  </Box>
                </Flex>
                <Center>
                  <BarChart
                    h={400}
                    data={dataKematian}
                    dataKey="tahun"
                    series={[
                      { name: 'kematianKasar', color: '#26308A' },
                      { name: 'kematianBayi', color: '#135A9B' },
                      { name: 'kelahiranKasar', color: '#3290CA' },
                    ]}
                    tickLine="y"
                  />
                </Center>
              </Box>
            </Paper>
          </Box>
          {/* Bar Chart Penyakit */}
          <Box>
            <Paper p={"xl"} bg={colors['white-trans-1']}>
              <Box pb={30}>
                <Text pb={30} fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>
                  Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik
                </Text>
                <Center>
                  <BarChart
                    p={20}
                    mb={30}
                    h={500}
                    data={dataPenyakit}
                    dataKey='penyakit'
                    orientation='vertical'
                    yAxisProps={{ width: 80 }}
                    barProps={{ radius: 10 }}
                    series={[{ name: 'penderita', color: colors['blue-button'] }]}
                  />
                </Center>
                <Text ta={"center"} fw={"bold"} fz={"h4"}>Jumlah Penderita</Text>
              </Box>
            </Paper>
          </Box>
          {/* Artikel Kesehatan */}
          <Box>
            <SimpleGrid
              cols={{
                base: 1,
                md: 3,
              }}
            >
              {/* Fasilitas Kesehatan */}
              <Box>
                <Paper p={'xl'} h={'112vh'} bg={colors['white-trans-1']}>
                  <Stack gap={'xs'}>
                    <Text ta={'center'} fw={"bold"} fz={'h3'} c={colors['blue-button']}>Fasilitas Kesehatan</Text>
                    <Box>
                      <Text fz={'h4'}>
                        UPTD Puskesmas Abiansemal III
                      </Text>
                      <Text fz={'h4'}>
                        Jl. Ratna, Sibang Kaja
                      </Text>
                      <Text fz={'h4'}>
                        08:00-16:00 WITA
                        (Senin-Sabtu)
                      </Text>
                      <Text fz={'h4'}>
                        Layanan Unggulan: Poli Umum, Poli Gigi, Imunisasi, Ibu/KB
                      </Text>
                      <Anchor component={Link} href={'/darmasaba/kesehatan/data-kesehatan-warga/fasilitas-kesehatan'} c={'black'} variant='transparent'>
                        <Text c={'black'} fz={'h4'}>
                          Detail Lengkap {'>>'}
                        </Text>
                      </Anchor>
                    </Box>
                    <Divider color={colors['blue-button']} px={'xl'} />
                    <Box>
                      <Text fz={'h4'}>
                        UPTD Puskesmas Abiansemal III
                      </Text>
                      <Text fz={'h4'}>
                        Jl. Ratna, Sibang Kaja
                      </Text>
                      <Text fz={'h4'}>
                        08:00-16:00 WITA
                        (Senin-Sabtu)
                      </Text>
                      <Text fz={'h4'}>
                        Layanan Unggulan: Poli Umum, Poli Gigi, Imunisasi, Ibu/KB
                      </Text>
                      <Anchor component={Link} href={'/darmasaba/kesehatan/data-kesehatan-warga/fasilitas-kesehatan'} c={'black'} variant='transparent'>
                        <Text c={'black'} fz={'h4'}>
                          Detail Lengkap {'>>'}
                        </Text>
                      </Anchor>
                    </Box>
                    <Divider color={colors['blue-button']} px={'xl'} />
                    <Box>
                      <Text fz={'h4'}>
                        UPTD Puskesmas Abiansemal III
                      </Text>
                      <Text fz={'h4'}>
                        Jl. Ratna, Sibang Kaja
                      </Text>
                      <Text fz={'h4'}>
                        08:00-16:00 WITA
                        (Senin-Sabtu)
                      </Text>
                      <Text fz={'h4'}>
                        Layanan Unggulan: Poli Umum, Poli Gigi, Imunisasi, Ibu/KB
                      </Text>
                      <Anchor component={Link} href={'/darmasaba/kesehatan/data-kesehatan-warga/fasilitas-kesehatan'} c={'black'} variant='transparent'>
                        <Text c={'black'} fz={'h4'}>
                          Detail Lengkap {'>>'}
                        </Text>
                      </Anchor>
                    </Box>
                    <Divider color={colors['blue-button']} px={'xl'}/>
                  </Stack>
                </Paper>
              </Box>
              {/* Jadwal Kegiatan */}
              <Box>
                <Paper p={'xl'} h={'112vh'} bg={colors['white-trans-1']}>
                  <Stack gap={'xs'}>
                    <Text ta={'center'} fw={"bold"} fz={'h3'} c={colors['blue-button']}>Jadwal Kegiatan</Text>
                    <Box>
                      <Text fz={'h4'} fw={'bold'} c={colors['blue-button']}>
                        21 Februari 2025
                      </Text>
                      <Text fz={'h4'} fw={'bold'}>
                        Posyandu Balita
                      </Text>
                      <Text fz={'h4'}>
                        08:00-12:00 WITA
                      </Text>
                      <Text fz={'h4'}>
                        Banjar Gulingan
                      </Text>
                      <Anchor c={colors['blue-button']} variant='transparent'>
                        <Text c={colors['blue-button']} fz={'h4'} >
                          Detail & Pendaftaran
                        </Text>
                      </Anchor>
                    </Box>
                    <Divider color={colors['blue-button']} px={'xl'} />
                    <Box>
                      <Text fz={'h4'} fw={'bold'} c={colors['blue-button']}>
                        23 Februari 2025
                      </Text>
                      <Text fz={'h4'} fw={'bold'}>
                        Donor Darah
                      </Text>
                      <Text fz={'h4'}>
                        09:00-14:00 WITA
                      </Text>
                      <Text fz={'h4'}>
                      Puskesmas Abiansemal III
                      </Text>
                      <Anchor c={colors['blue-button']} variant='transparent'>
                        <Text c={colors['blue-button']} fz={'h4'} >
                          Detail & Pendaftaran
                        </Text>
                      </Anchor>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
              {/* Artikel Kesehatan */}
              <Box>
                <Paper p={'xl'} h={'112vh'} bg={colors['white-trans-1']}>
                  <Stack gap={'xs'}>
                    <Box>
                    <Text ta={'center'} fw={"bold"} fz={'h3'} c={colors['blue-button']}>Artikel Kesehatan</Text>
                    <Image pt={5} src={'/api/img/dbd.png'} alt="" />
                      <Text fz={'h4'} fw={'bold'} >
                      Tips Mencegah Demam Berdarah Saat Musim Hujan
                      </Text>
                      <Text fz={'h6'} pb={10}>
                      Diposting: 12 Februari 2025 | Dinas Kesehatan
                      </Text>
                      <Text fz={'h4'} pb={10}>
                      Yuk Kenali gelaja dan cara penanganan DBD yang efektif untuk melindungi keluarga anda selama musim hujan.
                      </Text>
                      <Anchor c={'black'} variant='transparent'>
                        <Text c={'black'} fz={'h4'} >
                          Baca Selengkapnya {'>>'}
                        </Text>
                      </Anchor>
                    </Box>
                    <Divider color={colors['blue-button']} px={'xl'} />
                    <Box>
                    <Text ta={'center'} fw={"bold"} fz={'h3'} c={colors['blue-button']}>Artikel Kesehatan</Text>
                    <Image pt={5} src={'/api/img/dbd.png'} alt="" />
                      <Text fz={'h4'} fw={'bold'} >
                      Tips Mencegah Demam Berdarah Saat Musim Hujan
                      </Text>
                      <Text fz={'h6'} pb={10}>
                      Diposting: 12 Februari 2025 | Dinas Kesehatan
                      </Text>
                      <Text fz={'h4'} pb={10}>
                      Yuk Kenali gelaja dan cara penanganan DBD yang efektif untuk melindungi keluarga anda selama musim hujan.
                      </Text>
                      <Anchor c={'black'} variant='transparent'>
                        <Text c={'black'} fz={'h4'} >
                          Baca Selengkapnya {'>>'}
                        </Text>
                      </Anchor>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </SimpleGrid>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
