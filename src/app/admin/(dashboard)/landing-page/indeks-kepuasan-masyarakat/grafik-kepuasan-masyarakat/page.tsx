/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import colors from '@/con/colors';
import { PieChart, BarChart } from '@mantine/charts';
import {
  Box,
  Center,
  Flex,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

function Page() {
  const state = useProxy(indeksKepuasanState.responden);
  const { data, loading } = state.findMany;
  const [donutDataJenisKelamin, setDonutDataJenisKelamin] = useState<ChartDataItem[]>([]);
  const [donutDataRating, setDonutDataRating] = useState<ChartDataItem[]>([]);
  const [donutDataKelompokUmur, setDonutDataKelompokUmur] = useState<ChartDataItem[]>([]);
  const [barChartData, setBarChartData] = useState<Array<{ month: string; count: number }>>([]);

  useShallowEffect(() => {
    if (!data && !loading) {
      state.findMany.load();
      return;
    }
    if (data) {
      const totalLaki = data.filter((item: any) => item.jenisKelamin?.name?.toLowerCase() === 'laki-laki').length;
      const totalPerempuan = data.filter((item: any) => item.jenisKelamin?.name?.toLowerCase() === 'perempuan').length;

      const totalSangatBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'sangat baik').length;
      const totalBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'baik').length;
      const totalKurangBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'kurang baik').length;
      const totalSangatKurangBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'sangat kurang baik').length;

      const totalMuda = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'muda').length;
      const totalDewasa = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'dewasa').length;
      const totalLansia = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'lansia').length;

      setDonutDataJenisKelamin([
        { name: 'Laki-laki', value: totalLaki, color: colors['blue-button'] },
        { name: 'Perempuan', value: totalPerempuan, color: '#10A85AFF' },
      ]);

      setDonutDataRating([
        { name: 'Sangat Baik', value: totalSangatBaik, color: colors['blue-button'] },
        { name: 'Baik', value: totalBaik, color: '#10A85AFF' },
        { name: 'Kurang Baik', value: totalKurangBaik, color: '#FFA500' },
        { name: 'Sangat Kurang Baik', value: totalSangatKurangBaik, color: '#FF4500' },
      ]);

      setDonutDataKelompokUmur([
        { name: 'Muda', value: totalMuda, color: colors['blue-button'] },
        { name: 'Dewasa', value: totalDewasa, color: '#10A85AFF' },
        { name: 'Lansia', value: totalLansia, color: '#FFA500' },
      ]);

      const monthYearMap = new Map<string, number>();

      data.forEach((item: any) => {
        const dateValue = item.tanggal || item.createdAt;
        if (!dateValue) return;

        const parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) return;

        const month = parsedDate.getMonth() + 1;
        const year = parsedDate.getFullYear();
        const monthYearKey = `${year}-${String(month).padStart(2, '0')}`;

        monthYearMap.set(monthYearKey, (monthYearMap.get(monthYearKey) || 0) + 1);
      });

      const barData = Array.from(monthYearMap.entries())
        .map(([key, count]) => {
          const [year, month] = key.split('-');
          const monthName = new Date(Number(year), Number(month) - 1, 1)
            .toLocaleString('id-ID', { month: 'long' });
          return {
            month: `${monthName} ${year}`,
            count,
            sortKey: parseInt(`${year}${String(month).padStart(2, '0')}`, 10),
          };
        })
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ month, count }) => ({ month, count }));

      setBarChartData(barData);
    }
  }, [data]);

  if (loading || !data) {
    return (
      <Stack py="xl">
        <Skeleton height={750} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Stack py="xl">
        <Text c="dimmed" ta="center" size="lg">
          Belum ada data yang tersedia
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Paper withBorder bg={colors['white-1']} p="lg" radius="xl" shadow="sm">
        <Title order={3} mb="md" ta="center">Tren Jumlah Responden</Title>
        <Box h={320}>
          <BarChart
            h={300}
            data={barChartData}
            dataKey="month"
            series={[{ name: 'count', color: colors['blue-button'] }]}
            tickLine="y"
            xAxisLabel="Bulan"
            yAxisLabel="Jumlah Responden"
            withTooltip
            tooltipAnimationDuration={200}
          />
        </Box>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Paper withBorder bg={colors['white-1']} p="lg" radius="xl" shadow="sm">
          <Stack>
            <Title order={4} ta="center">Distribusi Jenis Kelamin</Title>
            {donutDataJenisKelamin.every(item => item.value === 0) ? (
              <Text c="dimmed" ta="center" my="md">
                Tidak ada data
              </Text>
            ) : (
              <Box>
                <Center>
                  <PieChart
                    withLabels
                    withTooltip
                    labelsType="percent"
                    size={180}
                    data={donutDataJenisKelamin}
                  />
                </Center>
                <Stack gap="xs" mt="md">
                  {donutDataJenisKelamin.map((entry) => (
                    <Flex key={entry.name} gap="sm" align="center">
                      <Box bg={entry.color} w={14} h={14} style={{ borderRadius: 4, flexShrink: 0 }} />
                      <Text size="sm" fw={500}>{entry.name}: {entry.value}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper withBorder bg={colors['white-1']} p="lg" radius="xl" shadow="sm">
          <Stack>
            <Title order={4} ta="center">Distribusi Penilaian</Title>
            {donutDataRating.every(item => item.value === 0) ? (
              <Text c="dimmed" ta="center" my="md">
                Tidak ada data
              </Text>
            ) : (
              <Box>
                <Center>
                  <PieChart
                    withLabels
                    withTooltip
                    labelsType="percent"
                    size={180}
                    data={donutDataRating}
                  />
                </Center>
                <Stack gap="xs" mt="md">
                  {donutDataRating.map((entry) => (
                    <Flex key={entry.name} gap="sm" align="center">
                      <Box bg={entry.color} w={14} h={14} style={{ borderRadius: 4, flexShrink: 0 }} />
                      <Text size="sm" fw={500}>{entry.name}: {entry.value}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper withBorder bg={colors['white-1']} p="lg" radius="xl" shadow="sm">
          <Stack>
            <Title order={4} ta="center">Distribusi Kelompok Umur</Title>
            {donutDataKelompokUmur.every(item => item.value === 0) ? (
              <Text c="dimmed" ta="center" my="md">
                Tidak ada data
              </Text>
            ) : (
              <Box>
                <Center>
                  <PieChart
                    withLabels
                    withTooltip
                    labelsType="percent"
                    size={180}
                    data={donutDataKelompokUmur}
                  />
                </Center>
                <Stack gap="xs" mt="md">
                  {donutDataKelompokUmur.map((entry) => (
                    <Flex key={entry.name} gap="sm" align="center">
                      <Box bg={entry.color} w={14} h={14} style={{ borderRadius: 4, flexShrink: 0 }} />
                      <Text size="sm" fw={500}>{entry.name}: {entry.value}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

export default Page;
