/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Flex, Paper, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconBabyCarriage, IconGrave2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';

type TooltipPayload = {
  name: string;
  value: number;
  payload: any;
  color: string;
  dataKey: string;
};

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

function PersentaseDataKelahiranKematian() {
  return (
    <Stack gap={"xs"}>
      <GrafikPersentaseKelahiranKematian />
    </Stack>
  );
}
function GrafikPersentaseKelahiranKematian() {
  const router = useRouter();
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
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Format number to Indonesian locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Format tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="md" shadow="md" withBorder>
          <Text size="sm" fw={500} mb={5}>Tahun {label}</Text>
          <Text size="sm" c="blue">Kelahiran: {formatNumber(payload[0].value)}</Text>
          <Text size="sm" c="red">Kematian: {formatNumber(payload[1].value)}</Text>
        </Paper>
      );
    }
    return null;
  };

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
      setSelectedYear(sortedData[0]?.tahun || '');
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

  const selectedYearData = chartData.find(d => d.tahun === selectedYear);

  return (
    <Paper bg={colors['white-1']} p="md">
      <Stack gap={"xs"}>
        <Title order={3} mb="md">Statistik Kelahiran & Kematian</Title>
        <Box>
          <Flex gap={"xs"}>
            <Box>
              <ActionIcon size={30} color={colors['blue-button']} onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran')}>
                <IconBabyCarriage size={30} color={colors['white-1']} />
              </ActionIcon>
            </Box>
            <Box>
              <ActionIcon size={30} color={colors['blue-button']} onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian')} >
                <IconGrave2 size={30} color={colors['white-1']} />
              </ActionIcon>
            </Box>
          </Flex>
        </Box>
      </Stack>

      {chartData.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          Belum ada data yang tersedia untuk ditampilkan
        </Text>
      ) : (
        <>
          {/* Year Selector */}
          <Box mb="md">
            <Text mb="xs" fw={500}>Pilih Tahun:</Text>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {chartData.map(({ tahun }) => (
                <Button
                  key={tahun}
                  variant={selectedYear === tahun ? 'filled' : 'outline'}
                  onClick={() => setSelectedYear(tahun)}
                  size="xs"
                >
                  {tahun}
                </Button>
              ))}
            </div>
          </Box>

          {/* Main Chart */}
          <Center>
            <Box h={400}>
              <BarChart
                width={isMobile ? window.innerWidth * 0.9 : isTablet ? 700 : 800}
                height={350}
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="tahun" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="totalKelahiran" name="Total Kelahiran" fill="#4dabf7" />
                <Bar dataKey="totalKematian" name="Total Kematian" fill="#f03e3e" />
              </BarChart>
            </Box>
          </Center>

          {/* Yearly Breakdown */}
          {selectedYearData && (
            <Box mt="xl">
              <Title order={4} mb="md">Rincian Tahun {selectedYear}</Title>
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Bulan</Table.Th>
                    <Table.Th ta="right">Kelahiran</Table.Th>
                    <Table.Th ta="right">Kematian</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedYearData.data.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>{item.bulan}</Table.Td>
                      <Table.Td ta="right">{formatNumber(item.kelahiran)}</Table.Td>
                      <Table.Td ta="right">{formatNumber(item.kematian)}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr style={{ fontWeight: 'bold' }}>
                    <Table.Td>Total</Table.Td>
                    <Table.Td ta="right">{formatNumber(selectedYearData.totalKelahiran)}</Table.Td>
                    <Table.Td ta="right">{formatNumber(selectedYearData.totalKematian)}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}

export default PersentaseDataKelahiranKematian;
