/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import {
  Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack,
  Table, TableTbody, TableTd, TableTh, TableThead, TableTr,
  Text, Title, Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { BarChart } from '@mantine/charts';

import HeaderSearch from '../../_com/header';
import jumlahPengangguranState from '../../_state/ekonomi/jumlah-pengangguran';

function DetailDataPengangguran() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title='Detail Data Pengangguran'
        placeholder='Cari bulan atau tahun...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDetailDataPengangguran search={search} />
    </Box>
  );
}

function ListDetailDataPengangguran({ search }: { search: string }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateDetail.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, search);
  }, [page, search]);

  useEffect(() => {
    if (data) {
      setChartData(
        data.map((item) => ({
          id: item.id,
          month: item.month,
          year: Number(item.year),
          educatedUnemployment: Number(item.educatedUnemployment),
          uneducatedUnemployment: Number(item.uneducatedUnemployment),
          percentageChange: Number(item.percentageChange),
          totalUnemployment: Number(item.totalUnemployment),
        }))
      );
    }
  }, [data]);

  const filteredData = data || []

  // Loading state
  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py="md" gap="lg">
      {/* Table Section */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Detail Data Pengangguran</Title>
          <Tooltip label="Tambah Data Baru" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/ekonomi/jumlah-pengangguran/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Bulan</TableTh>
                <TableTh style={{ width: '20%' }}>Terdidik</TableTh>
                <TableTh style={{ width: '20%' }}>Tidak Terdidik</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.month} {item.year}</TableTd>
                    <TableTd>{item.educatedUnemployment}</TableTd>
                    <TableTd>{item.uneducatedUnemployment}</TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/${item.id}`)}
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
                      <Text c="dimmed">Tidak ada data yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
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

      {/* Chart Section */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Title order={4} mb="md">
          Data Pengangguran Terdidik & Tidak Terdidik
        </Title>
        {mounted && chartData.length > 0 ? (
          <Box w={{ base: '100%', md: '70%' }}>
            <BarChart
              h={450}
              data={chartData}
              dataKey="month"
              series={[
                { name: 'educatedUnemployment', color: 'red.6', label: 'Terdidik' },
                { name: 'uneducatedUnemployment', color: 'orange.6', label: 'Tidak Terdidik' },
              ]}
            />
          </Box>
        ) : (
          <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
        )}
      </Paper>
    </Stack>
  );
}

export default DetailDataPengangguran;
