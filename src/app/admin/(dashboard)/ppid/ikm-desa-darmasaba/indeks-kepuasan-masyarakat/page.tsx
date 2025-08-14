/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import colors from '@/con/colors';
import { PieChart, BarChart } from '@mantine/charts'; // ✅ Ganti recharts dengan Mantine
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
  label?: string;
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
        { name: 'Laki-laki', value: totalLaki, color: colors['blue-button'] },
        { name: 'Perempuan', value: totalPerempuan, color: '#10A85AFF' },
      ]);

      // Update rating chart data
      setDonutDataRating([
        { name: 'Sangat Baik', value: totalSangatBaik, color: colors['blue-button'] },
        { name: 'Baik', value: totalBaik, color: '#10A85AFF' },
        { name: 'Kurang Baik', value: totalKurangBaik, color: '#FFA500' },
        { name: 'Sangat Kurang Baik', value: totalSangatKurangBaik, color: '#FF4500' },
      ]);

      // Update age group chart data
      setDonutDataKelompokUmur([
        { name: 'Muda', value: totalMuda, color: colors['blue-button'] },
        { name: 'Dewasa', value: totalDewasa, color: '#10A85AFF' },
        { name: 'Lansia', value: totalLansia, color: '#FFA500' },
      ]);

      // Process data for bar chart (group by month)
      const monthYearMap = new Map<string, number>();

      data.forEach((item: any) => {
        // Try both createdAt and tanggal fields
        const dateValue = item.tanggal || item.createdAt;
        if (!dateValue) return;

        const parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) return;

        const month = parsedDate.getMonth() + 1;
        const year = parsedDate.getFullYear();
        const monthYearKey = `${year}-${String(month).padStart(2, '0')}`;

        monthYearMap.set(monthYearKey, (monthYearMap.get(monthYearKey) || 0) + 1);
      });

      // Convert map to array and sort by date
      const barData = Array.from(monthYearMap.entries())
        .map(([key, count]) => {
          const [year, month] = key.split('-');
          const monthName = new Date(Number(year), Number(month) - 1, 1)
            .toLocaleString('id-ID', { month: 'long' });
          return {
            month: `${monthName} ${year}`,
            count,
            sortKey: parseInt(`${year}${String(month).padStart(2, '0')}`, 10)
          };
        })
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ month, count }) => ({ month, count }));

      setBarChartData(barData);
    }
  }, [data]);

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
        <Text c="dimmed" ta="center" my="md">
          Belum ada data untuk ditampilkan
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      {/* Bar Chart - Data per Tanggal */}
      <Paper bg={colors['white-1']} p="md" radius="md" mb="md">
        <Title order={4} mb="md" ta="center">Jumlah Responden per Bulan</Title>
        <Box h={300}>
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

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {/* Chart Jenis Kelamin */}
        <Paper bg={colors['white-1']} p="md" radius="md">
          <Stack>
            <Title order={4}>Jenis Kelamin</Title>
            {donutDataJenisKelamin.every(item => item.value === 0) ? (
              <Text c="dimmed" ta="center" my="md">
                Belum ada data untuk ditampilkan dalam grafik
              </Text>
            ) : (
              <Box>
                <Center>
                  <PieChart
                    withLabels
                    withTooltip
                    labelsType="percent"
                    size={250}
                    data={donutDataJenisKelamin}
                  />
                </Center>
                <Stack gap="sm" mt="md">
                  {donutDataJenisKelamin.map((entry) => (
                    <Flex key={entry.name} gap="md" align="center">
                      <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                      <Text size="sm">{entry.name}: {entry.value}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Chart Rating */}
        <Paper bg={colors['white-1']} p="md" radius="md">
          <Stack>
            <Title order={4}>Pilihan</Title>
            {donutDataRating.every(item => item.value === 0) ? (
              <Text c="dimmed" ta="center" my="md">
                Belum ada data untuk ditampilkan dalam grafik
              </Text>
            ) : (
              <Box>
                <Center>
                  <PieChart
                    withLabels
                    withTooltip
                    labelsType="percent"
                    size={250}
                    data={donutDataRating}
                  />
                </Center>
                <Stack gap="sm" mt="md">
                  {donutDataRating.map((entry) => (
                    <Flex key={entry.name} gap="md" align="center">
                      <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                      <Text size="sm">{entry.name}: {entry.value}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Chart Kelompok Umur */}
        <Paper bg={colors['white-1']} p="md" radius="md">
          <Stack>
            <Title order={4}>Umur</Title>
            {donutDataKelompokUmur.every(item => item.value === 0) ? (
              <Text c="dimmed" ta="center" my="md">
                Belum ada data untuk ditampilkan dalam grafik
              </Text>
            ) : (
              <Box>
                <Center>
                  <PieChart
                    withLabels
                    withTooltip
                    labelsType="percent"
                    size={250}
                    data={donutDataKelompokUmur}
                  />
                </Center>
                <Stack gap="sm" mt="md">
                  {donutDataKelompokUmur.map((entry) => (
                    <Flex key={entry.name} gap="md" align="center">
                      <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                      <Text size="sm">{entry.name}: {entry.value}</Text>
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