/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import {
  Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack,
  Table, TableTbody, TableTd, TableTh, TableThead, TableTr,
  Text, Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

import HeaderSearch from '../../_com/header';
import jumlahPengangguranState from '../../_state/ekonomi/jumlah-pengangguran';

function DetailDataPengangguran() {
  const [search, setSearch] = useState("");

  return (
    <Stack>
      <HeaderSearch
        title='Detail Data Pengangguran'
        placeholder='Cari bulan atau tahun...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDetailDataPengangguran search={search} />
    </Stack>
  );
}

function ListDetailDataPengangguran({ search }: { search: string }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateDetail.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

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

  const filteredData = data || [];

  // Loading state
  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }} gap="lg">
        <Skeleton h={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py={{ base: 'md', md: 'lg' }} gap="lg">
      {/* Table / Card Section */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Detail Data Pengangguran
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/jumlah-pengangguran/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            withTableBorder
            withRowBorders
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Bulan</TableTh>
                <TableTh style={{ width: '25%' }}>Terdidik</TableTh>
                <TableTh style={{ width: '25%' }}>Tidak Terdidik</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.month} {item.year}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.educatedUnemployment}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.uneducatedUnemployment}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/${item.id}`)}
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5} fz="sm" fw={500} lh={1.4}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" fw={500} lh={1.4}>
                        Tidak ada data yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Bulan
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.month} {item.year}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Terdidik
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.educatedUnemployment}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Tidak Terdidik
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.uneducatedUnemployment}
                      </Text>
                    </Box>
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/${item.id}`)}
                      mt="xs"
                    >
                      <IconDeviceImac size={18} />
                      <Text ml={5} fz="sm" fw={500} lh={1.4}>
                        Detail
                      </Text>
                    </Button>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" fw={500} lh={1.4}>
                  Tidak ada data yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}

      {/* Chart Section */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Title order={4} lh={1.2} mb={{ base: 'sm', md: 'md' }}>
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
          <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} fw={500} lh={1.5}>
            Belum ada data untuk ditampilkan dalam grafik
          </Text>
        )}
      </Paper>
    </Stack>
  );
}

export default DetailDataPengangguran;