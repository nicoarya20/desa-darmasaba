'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from '@/con/colors';
import { BarChart as MantineBarChart } from '@mantine/charts';
import { Anchor, Box, Center, ColorSwatch, Divider, Flex, Image, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';

import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import { useProxy } from 'valtio/utils';
import GrafikPenyakit from './grafik-penyakit/page';


function Page() {
  type DataTahunan = {
    tahun: string;
    totalKelahiran: number;
    totalKematian: number;
    data: Array<{
      id: string;
      bulan: string;
      kelahiran: number;
      kematian: number;
    }>;
  };

  // Count occurrences per year
  const countByYear = (data: any[], dateField: string) => {
    const counts: Record<string, number> = {};
    data?.forEach(item => {
      const year = new Date(item[dateField]).getFullYear().toString();
      counts[year] = (counts[year] || 0) + 1;
    });
    return counts;
  };

  const statePersentase = useProxy(persentasekelahiran);
  const [chartData, setChartData] = useState<DataTahunan[]>([]);
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');


  useShallowEffect(() => {
    statePersentase.kelahiran.findMany.load(1, 1000); // Load all kelahiran data
    statePersentase.kematian.findMany.load(1, 1000); // Load all kematian data
  }, []);

  useEffect(() => {
    if (statePersentase.kelahiran.findMany.data && statePersentase.kematian.findMany.data) {
      // Count kelahiran and kematian by year
      const kelahiranByYear = countByYear(statePersentase.kelahiran.findMany.data, 'tanggal');
      const kematianByYear = countByYear(statePersentase.kematian.findMany.data, 'tanggal');

      // Get all unique years
      const allYears = new Set([
        ...Object.keys(kelahiranByYear),
        ...Object.keys(kematianByYear)
      ]);

      // Create data structure for the chart
      const dataByYear = Array.from(allYears).reduce<Record<string, DataTahunan>>((acc, year) => {
        acc[year] = {
          tahun: year,
          totalKelahiran: kelahiranByYear[year] || 0,
          totalKematian: kematianByYear[year] || 0,
          data: []
        };
        return acc;
      }, {});

      const sortedData = Object.values(dataByYear).sort((a, b) =>
        parseInt(a.tahun) - parseInt(b.tahun)
      );

      setChartData(sortedData);
    }
  }, [
    statePersentase.kelahiran.findMany.data,
    statePersentase.kematian.findMany.data,
  ]);

  if (!statePersentase.kelahiran.findMany.data || !statePersentase.kematian.findMany.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    );
  }
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
                      <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Angka Kematian</Text>
                      <ColorSwatch color="#EF3E3E" size={30} />
                    </Flex>
                  </Box>
                  <Box>
                    <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                      <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Angka Kelahiran</Text>
                      <ColorSwatch color="#3290CA" size={30} />
                    </Flex>
                  </Box>
                </Flex>
                {chartData.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    Belum ada data yang tersedia untuk ditampilkan
                  </Text>
                ) : (
                  <>
                    {/* Main Chart */}
                    <Center>
                      <Box h={400}>
                        <Box style={{
                          width: isMobile ? '90vw' : isTablet ? '700px' : '800px',
                          maxWidth: '100%',
                          margin: '0 auto'
                        }}>
                          <MantineBarChart
                            h={350}
                            data={chartData}
                            dataKey="tahun"
                            series={[
                              { name: 'totalKelahiran', label: 'Total Kelahiran', color: '#3290CA' },
                              { name: 'totalKematian', label: 'Total Kematian', color: '#f03e3e' }
                            ]}
                            tickLine="y"
                          />
                        </Box>
                      </Box>
                    </Center>
                  </>
                )}
              </Box>
            </Paper>
          </Box>
          <GrafikPenyakit />
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
                        <Text c={colors['blue-button']} fz={'h4'}>
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
                        <Text c={colors['blue-button']} fz={'h4'}>
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
                        <Text c={colors['blue-button']} fz={'h4'}>
                          Detail Lengkap {'>>'}
                        </Text>
                      </Anchor>
                    </Box>
                    <Divider color={colors['blue-button']} px={'xl'} />
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
                      <Anchor component={Link} href={'/darmasaba/kesehatan/data-kesehatan-warga/jadwal-kegiatan'} c={colors['blue-button']} variant='transparent'>
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
                      <Anchor component={Link} href={'/darmasaba/kesehatan/data-kesehatan-warga/jadwal-kegiatan'} c={colors['blue-button']} variant='transparent'>
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
                      <Anchor c={'black'} component={Link} href={'/darmasaba/kesehatan/data-kesehatan-warga/artikel-kesehatan'} variant='transparent'>
                        <Text c={colors['blue-button']} fz={'h4'} >
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
                      <Anchor c={'black'} href={'/darmasaba/kesehatan/data-kesehatan-warga/artikel-kesehatan'} variant='transparent'>
                        <Text c={colors['blue-button']} fz={'h4'} >
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
