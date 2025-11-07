'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip as RechartTooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import programKemiskinanState from '../../_state/ekonomi/program-kemiskinan';

function ProgramKemiskinan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Program Kemiskinan'
        placeholder='Cari judul program atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKemiskinan search={search} />
    </Box>
  );
}

function ListProgramKemiskinan({ search }: { search: string }) {
  const programState = useProxy(programKemiskinanState);
  const router = useRouter();
  const [lineChart, setLineChart] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const { data, page, totalPages, loading, load } = programState.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, search);
  }, [page, search]);

  useEffect(() => {
    if (data) {
      const chartData = data
        .filter(item => item.statistik)
        .map(item => ({
          tahun: item.statistik?.tahun,
          jumlah: Number(item.statistik?.jumlah)
        }))
        .sort((a, b) => (a.tahun || 0) - (b.tahun || 0));

      setLineChart(chartData);
    }
  }, [data]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Program Kemiskinan</Title>
          <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/ekonomi/program-kemiskinan/create')}>
            Tambah Baru
          </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Judul Program</TableTh>
                <TableTh style={{ width: '40%' }}>Deskripsi Singkat</TableTh>
                <TableTh style={{ width: '20%' }}>Jumlah Masyarakat Miskin</TableTh>
                <TableTh style={{ width: '10%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate lineClamp={1}>{item.nama}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" truncate lineClamp={2} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </TableTd>
                    <TableTd>{item.statistik?.jumlah || '-'}</TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/ekonomi/program-kemiskinan/${item.id}`)}
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data program kemiskinan yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>

      {/* Chart */}
      <Box py={10}>
        <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
          <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
          {mounted && lineChart.length > 0 ? (
            <Box style={{ width: '100%', overflowX: 'auto' }}>
              <LineChart width={820} height={300} data={lineChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tahun" />
                <YAxis />
                <RechartTooltip
                  formatter={(value: any, name: string) => [`${value} orang`, name]}
                  labelFormatter={(label: any) => `Tahun: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="jumlah" name="Jumlah per Tahun" stroke={colors['blue-button']} />
              </LineChart>
            </Box>
          ) : (
            <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default ProgramKemiskinan;
