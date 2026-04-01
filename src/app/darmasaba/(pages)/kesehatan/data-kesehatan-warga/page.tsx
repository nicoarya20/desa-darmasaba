'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from '@/con/colors';
import { BarChart as MantineBarChart } from '@mantine/charts';
import { Box, Center, ColorSwatch, Flex, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import { useProxy } from 'valtio/utils';

import FasilitasKesehatan from './fasilitas-kesehatan-page/page';
import GrafikPenyakit from './grafik-penyakit/page';
import JadwalKegiatan from './jadwal-kegiatan-page/page';
import ArtikelKesehatanPage from './artikel-kesehatan-page/page';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

  useShallowEffect(() => {
    statePersentase.kelahiran.findMany.load(1, 1000);
    statePersentase.kematian.findMany.load(1, 1000);
  }, []);

  useEffect(() => {
    if (statePersentase.kelahiran.findMany.data && statePersentase.kematian.findMany.data) {
      const kelahiranByYear = countByYear(statePersentase.kelahiran.findMany.data, 'tanggal');
      const kematianByYear = countByYear(statePersentase.kematian.findMany.data, 'tanggal');

      const allYears = new Set([
        ...Object.keys(kelahiranByYear),
        ...Object.keys(kematianByYear)
      ]);

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
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* Page Title */}
      <Title
        order={1}
        ta="center"
        c={colors['blue-button']}
        fw="bold"
        lh={1.2}
      >
        Data Kesehatan Masyarakat Puskesmas Darmasaba
      </Title>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg">
          {/* Bar Chart Kematian Kelahiran */}
          <Box>
            <Paper p="xl" bg={colors['white-trans-1']}>
              <Box pb={30}>
                <Title order={2} mb="md" ta="center">
                  Data Kematian dan Kelahiran
                </Title>

                {chartData.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl" size="md">
                    Belum ada data yang tersedia untuk ditampilkan
                  </Text>
                ) : (
                  <>
                    <Center>
                      <Box h={400}>
                        <Box style={{
                          width: isMobile ? '90vw' : '800px',
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

                <Flex pb={30} justify="center" gap="xl" align="center" wrap="wrap">
                  <Box>
                    <Flex gap={{ base: 'xs', md: 'sm' }} align="center">
                      <Text fw="bold" fz={{ base: 'sm', md: 'md' }}>
                        Angka Kematian
                      </Text>
                      <ColorSwatch color="#EF3E3E" size={30} />
                    </Flex>
                  </Box>
                  <Box>
                    <Flex gap={{ base: 'xs', md: 'sm' }} align="center">
                      <Text fw="bold" fz={{ base: 'sm', md: 'md' }}>
                        Angka Kelahiran
                      </Text>
                      <ColorSwatch color="#3290CA" size={30} />
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Paper>
          </Box>

          <GrafikPenyakit />

          <Box>
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              <FasilitasKesehatan />
              <JadwalKegiatan />
              <ArtikelKesehatanPage />
            </SimpleGrid>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;