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
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
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

  const [debouncedSearch] = useDebouncedValue(search, 1000);

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
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap="md" py="md">
      {/* List Section */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            List Sektor Unggulan Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/sektor-unggulan-desa/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>Nama Sektor</TableTh>
                <TableTh style={{ width: '45%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '20%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.45} truncate="end">
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lineClamp={3} fw={500} lh={1.4} c={item.description ? 'inherit' : 'dimmed'} dangerouslySetInnerHTML={{ __html: item.description || '-' }} />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/ekonomi/sektor-unggulan-desa/${item.id}`)}
                        radius="md"
                        fz="sm"
                        px="sm"
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={6}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={24}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data sektor unggulan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Sektor
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Deskripsi
                    </Text>
                    <Box pl={8}>
                      <Text fz="sm" lineClamp={3} fw={500} lh={1.4} c={item.description ? 'inherit' : 'dimmed'} dangerouslySetInnerHTML={{ __html: item.description || '-' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() => router.push(`/admin/ekonomi/sektor-unggulan-desa/${item.id}`)}
                      fullWidth
                      mt="xs"
                      radius="md"
                      fz="sm"
                    >
                      <IconDeviceImac size={18} />
                      <Text ml={6}>Detail</Text>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={24}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data sektor unggulan yang cocok
              </Text>
            </Center>
          )}
        </Stack>
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
          color="blue"
          radius="md"
        />
      </Center>

      {/* Chart Section */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Title order={4} lh={1.2} pb={{ base: 'sm', md: 'md' }}>
          Grafik Sektor Unggulan Desa
        </Title>
        {loading ? (
          <Skeleton height={350} radius="md" />
        ) : chartData.length > 0 ? (
          <Box style={{ width: '100%', height: 350 }}>
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
            <Text c="dimmed" fz="sm" lh={1.4}>
              Belum ada data untuk ditampilkan dalam grafik
            </Text>
          </Center>
        )}
      </Paper>
    </Stack>
  );
}

export default SektorUnggulanDesa;