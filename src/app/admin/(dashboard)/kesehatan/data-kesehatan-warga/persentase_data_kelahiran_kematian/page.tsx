/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import persentasekelahiran from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { ActionIcon, Badge, Box, Center, Flex, Group, Paper, Select, Skeleton, Stack, Table, Text, Title, Tooltip as MantineTooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBabyCarriage, IconGrave2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, TooltipProps, XAxis, YAxis } from 'recharts';
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
    <Stack gap="md">
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

  // ✅ Fungsi hitung tahunan + bulanan
  const countByYearAndMonth = (kelahiran: any[], kematian: any[]): DataTahunan[] => {
    const dataTahunan: Record<string, DataTahunan> = {};

    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    kelahiran?.forEach((item: any) => {
      const date = new Date(item.tanggal);
      const tahun = date.getFullYear().toString();
      const bulanIndex = date.getMonth();

      if (!dataTahunan[tahun]) {
        dataTahunan[tahun] = {
          tahun,
          totalKelahiran: 0,
          totalKematian: 0,
          data: namaBulan.map((nama, idx) => ({
            id: `${tahun}-${idx + 1}`,
            bulan: nama,
            kelahiran: 0,
            kematian: 0
          }))
        };
      }

      dataTahunan[tahun].totalKelahiran += 1;
      dataTahunan[tahun].data[bulanIndex].kelahiran += 1;
    });

    kematian?.forEach((item: any) => {
      const date = new Date(item.tanggal);
      const tahun = date.getFullYear().toString();
      const bulanIndex = date.getMonth();

      if (!dataTahunan[tahun]) {
        dataTahunan[tahun] = {
          tahun,
          totalKelahiran: 0,
          totalKematian: 0,
          data: namaBulan.map((nama, idx) => ({
            id: `${tahun}-${idx + 1}`,
            bulan: nama,
            kelahiran: 0,
            kematian: 0
          }))
        };
      }

      dataTahunan[tahun].totalKematian += 1;
      dataTahunan[tahun].data[bulanIndex].kematian += 1;
    });

    return Object.values(dataTahunan).sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));
  };

  const statePersentase = useProxy(persentasekelahiran);
  const [chartData, setChartData] = useState<DataTahunan[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="sm" shadow="md" withBorder radius="md">
          <Text fz="sm" fw={600} lh={1.4}>Tahun {label}</Text>
          <Text fz="sm" c="blue.6" lh={1.4}>Kelahiran: {formatNumber(payload[0].value)}</Text>
          <Text fz="sm" c="red.6" lh={1.4}>Kematian: {formatNumber(payload[1].value)}</Text>
        </Paper>
      );
    }
    return null;
  };

  useShallowEffect(() => {
    statePersentase.kelahiran.findMany.load(1, 1000);
    statePersentase.kematian.findMany.load(1, 1000);
  }, []);

  useEffect(() => {
    if (statePersentase.kelahiran.findMany.data && statePersentase.kematian.findMany.data) {
      const hasil = countByYearAndMonth(
        statePersentase.kelahiran.findMany.data,
        statePersentase.kematian.findMany.data
      );

      setChartData(hasil);
      setSelectedYear(hasil[0]?.tahun || null);
    }
  }, [statePersentase.kelahiran.findMany.data, statePersentase.kematian.findMany.data]);

  if (!statePersentase.kelahiran.findMany.data || !statePersentase.kematian.findMany.data) {
    return <Skeleton h={400} radius="lg" />;
  }

  const selectedYearData = chartData.find(d => d.tahun === selectedYear);

  return (
    <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
      <Stack gap='md'>
        <Group justify="space-between" align="center">
          <Title order={3} fw={700} fz={{ base: 'sm', md: 'md' }} lh={1.2}>
            Statistik Kelahiran & Kematian
          </Title>
          <Flex gap="sm">
            <MantineTooltip label="Tambah Data Kelahiran" withArrow>
              <ActionIcon size="lg" radius="xl" color="blue.6" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran')}>
                <IconBabyCarriage size={22} />
              </ActionIcon>
            </MantineTooltip>
            <MantineTooltip label="Tambah Data Kematian" withArrow>
              <ActionIcon size="lg" radius="xl" color="red.6" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian')}>
                <IconGrave2 size={22} />
              </ActionIcon>
            </MantineTooltip>
          </Flex>
        </Group>

        {chartData.length === 0 ? (
          <Center py={{ base: 'xl', md: '2xl' }}>
            <Text c="dimmed" fs="italic" fz="sm" lh={1.4}>
              Belum ada data untuk ditampilkan
            </Text>
          </Center>
        ) : (
          <>
            <Box maw={220}>
              <Select
                label="Pilih Tahun"
                placeholder="Pilih tahun data"
                data={chartData.map((item) => ({ value: item.tahun, label: item.tahun }))}
                value={selectedYear}
                onChange={(value) => setSelectedYear(value || null)}
                size="sm"
                radius="md"
              />
            </Box>

            <Box h={360}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <XAxis dataKey="tahun" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalKelahiran" name="Kelahiran" fill="#4dabf7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalKematian" name="Kematian" fill="#f03e3e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {selectedYearData && (
              <Stack gap="md">
                <Flex align="center" gap="sm">
                  <Title order={4} fw={600} fz={{ base: 'xs', md: 'sm' }} lh={1.2}>
                    Rincian Tahun {selectedYear}
                  </Title>
                  <Badge variant="light" color="blue" fz={{ base: 'xs', md: 'sm' }}>
                    {formatNumber(selectedYearData.totalKelahiran)} kelahiran
                  </Badge>
                  <Badge variant="light" color="red" fz={{ base: 'xs', md: 'sm' }}>
                    {formatNumber(selectedYearData.totalKematian)} kematian
                  </Badge>
                </Flex>

                {/* Desktop: Table */}
                <Box visibleFrom="md">
                  <Table striped withTableBorder highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th fz="sm" fw={600} lh={1.4}>Bulan</Table.Th>
                        <Table.Th ta="right" fz="sm" fw={600} lh={1.4}>Kelahiran</Table.Th>
                        <Table.Th ta="right" fz="sm" fw={600} lh={1.4}>Kematian</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedYearData.data.length > 0 ? (
                        <>
                          {selectedYearData.data.map((item) => (
                            <Table.Tr key={item.id}>
                              <Table.Td fz="sm" fw={500} lh={1.5}>{item.bulan}</Table.Td>
                              <Table.Td ta="right" fz="sm" fw={500} lh={1.5}>
                                {formatNumber(item.kelahiran)}
                              </Table.Td>
                              <Table.Td ta="right" fz="sm" fw={500} lh={1.5}>
                                {formatNumber(item.kematian)}
                              </Table.Td>
                            </Table.Tr>
                          ))}
                          <Table.Tr>
                            <Table.Td fz="sm" fw={600} lh={1.5}>Total</Table.Td>
                            <Table.Td ta="right" fz="sm" fw={600} lh={1.5}>
                              {formatNumber(selectedYearData.totalKelahiran)}
                            </Table.Td>
                            <Table.Td ta="right" fz="sm" fw={600} lh={1.5}>
                              {formatNumber(selectedYearData.totalKematian)}
                            </Table.Td>
                          </Table.Tr>
                        </>
                      ) : (
                        <Table.Tr>
                          <Table.Td colSpan={3} ta="center" c="dimmed" fz="sm" lh={1.4}>
                            Tidak ada rincian bulanan
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </Box>

                {/* Mobile: Card List */}
                <Box hiddenFrom="md">
                  <Stack gap="xs">
                    {selectedYearData.data.length > 0 ? (
                      selectedYearData.data.map((item) => (
                        <Paper key={item.id} p="sm" radius="md" withBorder>
                          <Text fz="xs" fw={600} lh={1.4}>Bulan</Text>
                          <Text fz="sm" fw={500} lh={1.4} mb="sm">
                            {item.bulan}
                          </Text>
                          <Text fz="xs" fw={600} lh={1.4}>Kelahiran</Text>
                          <Text fz="sm" fw={500} lh={1.4} mb="sm">
                            {formatNumber(item.kelahiran)}
                          </Text>
                          <Text fz="xs" fw={600} lh={1.4}>Kematian</Text>
                          <Text fz="sm" fw={500} lh={1.4}>
                            {formatNumber(item.kematian)}
                          </Text>
                        </Paper>
                      ))
                    ) : (
                      <Center py="md">
                        <Text c="dimmed" fz="sm" lh={1.4}>Tidak ada rincian bulanan</Text>
                      </Center>
                    )}

                    {/* Total row mobile */}
                    {selectedYearData.data.length > 0 && (
                      <Paper p="sm" radius="md" withBorder bg="gray.1">
                        <Text fz="xs" fw={600} lh={1.4}>Total</Text>
                        <Flex justify="space-between" mt="xs">
                          <Text fz="sm" fw={600} lh={1.4}>Kelahiran</Text>
                          <Text fz="sm" fw={600} lh={1.4}>
                            {formatNumber(selectedYearData.totalKelahiran)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between" mt="xs">
                          <Text fz="sm" fw={600} lh={1.4}>Kematian</Text>
                          <Text fz="sm" fw={600} lh={1.4}>
                            {formatNumber(selectedYearData.totalKematian)}
                          </Text>
                        </Flex>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default PersentaseDataKelahiranKematian;