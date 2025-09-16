'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import grafikSektorUnggulan from '../../_state/ekonomi/sektor-unggulan-desa';

function SektorUnggulanDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Sektor Unggulan Desa"
        placeholder="Cari nama sektor atau nilai..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSektorUnggulanDesa search={search} />
    </Box>
  );
}

function ListSektorUnggulanDesa({ search }: { search: string }) {
  const router = useRouter();
  const state = useProxy(grafikSektorUnggulan);
  const [chartData, setChartData] = useState<
    { id: string; name: string; description: string | null; value: number | null }[]
  >([]);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useEffect(() => {
    if (state.findMany.data) {
      setChartData(
        state.findMany.data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          value: Number(item.value),
        }))
      );
    }
  }, [state.findMany.data]);

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap="md" py="md">
      {/* List Table */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Sektor Unggulan Desa</Title>
          <Tooltip label="Tambah Sektor Unggulan Desa" withArrow>
            <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/ekonomi/sektor-unggulan-desa/create')}>
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        {loading ? (
          <Skeleton height={300} radius="md" />
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '30%' }}>Nama Sektor</TableTh>
                  <TableTh style={{ width: '40%' }}>Deskripsi</TableTh>
                  <TableTh style={{ width: '15%' }}>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Box w={200}>
                          <Text fw={500} truncate="end" lineClamp={1}>
                            {item.name}
                          </Text>
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Box w={200}>
                          <Text truncate="end" fz="sm" c="dimmed" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.description || '-' }} />
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Tooltip label="Lihat detail sektor" withArrow>
                          <Button
                            variant="light"
                            color="blue"
                            onClick={() => router.push(`/admin/ekonomi/sektor-unggulan-desa/${item.id}`)}
                          >
                            <IconDeviceImac size={20} />
                            <Text ml={6}>Detail</Text>
                          </Button>
                        </Tooltip>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={3}>
                      <Center py={20}>
                        <Text color="dimmed">Tidak ada data sektor unggulan yang cocok</Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>
        )}
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

      {/* Chart */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Title order={4} pb="sm">
          Grafik Sektor Unggulan Desa
        </Title>
        {loading ? (
          <Skeleton height={350} radius="md" />
        ) : chartData.length > 0 ? (
          <Box style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="value" fill={colors['blue-button']} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Center py={50}>
            <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
          </Center>
        )}
      </Paper>
    </Stack>
  );
}

export default SektorUnggulanDesa;
