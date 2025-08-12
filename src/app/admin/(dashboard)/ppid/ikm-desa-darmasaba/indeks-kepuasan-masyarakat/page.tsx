/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react';
import { Box, Center, Flex, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import colors from '@/con/colors';
import { PieChart, Pie, Cell } from 'recharts';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  label?: string;
}

function Page() {
  const state = useProxy(indeksKepuasanState.responden);
  const { data, loading } = state.findMany;
  const [donutDataJenisKelamin, setDonutDataJenisKelamin] = useState<ChartDataItem[]>([]);
  const [donutDataRating, setDonutDataRating] = useState<ChartDataItem[]>([]);
  const [donutDataKelompokUmur, setDonutDataKelompokUmur] = useState<ChartDataItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useShallowEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      // Hitung total berdasarkan jenis kelamin
      const totalLaki = data.filter((item: any) => item.jenisKelamin?.name?.toLowerCase() === 'laki-laki').length;
      const totalPerempuan = data.filter((item: any) => item.jenisKelamin?.name?.toLowerCase() === 'perempuan').length;

      // Hitung total berdasarkan rating
      const totalSangatBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'sangat baik').length;
      const totalBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'baik').length;
      const totalKurangBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'kurang baik').length;
      const totalSangatKurangBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'sangat kurang baik').length;

      // Hitung total berdasarkan kelompok umur
      const totalMuda = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'muda').length;
      const totalDewasa = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'dewasa').length;
      const totalLansia = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'lansia').length;
      // Update gender chart data
      setDonutDataJenisKelamin([
        { name: 'laki', value: totalLaki, color: colors['blue-button'], label: 'Laki-laki' },
        { name: 'perempuan', value: totalPerempuan, color: '#10A85AFF', label: 'Perempuan' }
      ]);

      // Update rating chart data
      setDonutDataRating([
        { name: 'sangat_baik', value: totalSangatBaik, color: colors['blue-button'], label: 'Sangat Baik' },
        { name: 'baik', value: totalBaik, color: '#10A85AFF', label: 'Baik' },
        { name: 'kurang_baik', value: totalKurangBaik, color: '#FFA500', label: 'Kurang Baik' },
        { name: 'sangat_kurang_baik', value: totalSangatKurangBaik, color: '#FF4500', label: 'Sangat Kurang Baik' }
      ]);

      // Update age group chart data
      setDonutDataKelompokUmur([
        { name: 'muda', value: totalMuda, color: colors['blue-button'], label: 'Muda' },
        { name: 'dewasa', value: totalDewasa, color: '#10A85AFF', label: 'Dewasa' },
        { name: 'lansia', value: totalLansia, color: '#FFA500', label: 'Lansia' }
      ]);
    }
  }, [data])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={730} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Stack py={10}>
        <Text c='dimmed' ta="center" my="md">Belum ada data untuk ditampilkan</Text>
      </Stack>
    )
  }

  return (
    <Stack>
      {/* Chart */}
      <Box>
        <Paper bg={colors['white-1']} p={'md'} style={{ height: '100%' }}>
          <Stack>
            <Title pb={10} order={4} size="h4">Grafik Berdasarkan Jenis Kelamin Responden</Title>
            {mounted && donutDataJenisKelamin.length === 0 ? (
              <Text c='dimmed' ta="center" my="md">Belum ada data untuk ditampilkan dalam grafik</Text>
            ) : (
              <Box>
                <Center>
                  <PieChart width={250} height={350}>
                    <Pie
                      data={donutDataJenisKelamin}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {donutDataJenisKelamin.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </Center>
                <Stack gap="sm" mt="md">
                  {donutDataJenisKelamin.map((entry) => (
                    <Flex key={entry.name} gap="md" align="center">
                      <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                      <Text size="sm">{entry.label}: {entry.value || 0}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
      <Box>
        {/* Rating Chart */}
        <Paper bg={colors['white-1']} p={'md'} style={{ height: '100%' }}>
          <Stack>
            <Title pb={10} order={4}>Grafik Berdasarkan Rating Responden</Title>
            {mounted && donutDataRating.length === 0 ? (
              <Text c='dimmed' ta="center" my="md">Belum ada data untuk ditampilkan dalam grafik</Text>
            ) : (
              <Box>
                <Center>
                  <PieChart width={350} height={350}>
                    <Pie
                      data={donutDataRating}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {donutDataRating.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </Center>
                <Stack gap="sm" mt="md">
                  {donutDataRating.map((entry) => (
                    <Flex key={entry.name} gap="md" align="center">
                      <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                      <Text size="sm">{entry.label}: {entry.value || 0}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Age Group Chart */}
      <Box>
        <Paper bg={colors['white-1']} p={'md'} style={{ height: '100%' }}>
          <Stack>
            <Title pb={10} order={4}>Grafik Berdasarkan Kelompok Umur</Title>
            {mounted && donutDataKelompokUmur.length === 0 ? (
              <Text c='dimmed' ta="center" my="md">Belum ada data untuk ditampilkan dalam grafik</Text>
            ) : (
              <Box >
                <Center>
                  <PieChart width={350} height={350}>
                    <Pie
                      data={donutDataKelompokUmur}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {donutDataKelompokUmur.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </Center>
                <Stack gap="sm" mt="md">
                  {donutDataKelompokUmur.map((entry) => (
                    <Flex key={entry.name} gap="md" align="center">
                      <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                      <Text size="sm">{entry.label}: {entry.value || 0}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
