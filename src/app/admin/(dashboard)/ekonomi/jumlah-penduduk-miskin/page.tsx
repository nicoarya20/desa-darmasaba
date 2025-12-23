'use client';
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
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import jumlahPendudukMiskin from '../../_state/ekonomi/jumlah-penduduk-miskin';
import { BarChart } from '@mantine/charts';

function JumlahPendudukMiskin() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Jumlah Penduduk Miskin"
        placeholder="Cari tahun atau jumlah penduduk miskin..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListJumlahPendudukMiskin search={search} />
    </Box>
  );
}

function ListJumlahPendudukMiskin({ search }: { search: string }) {
  type JPMGrafik = { year: number; totalPoorPopulation: number };
  const stateJPM = useProxy(jumlahPendudukMiskin);
  const [chartData, setChartData] = useState<JPMGrafik[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, loading, load, totalPages } = stateJPM.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (stateJPM.findMany.data) {
      setChartData(
        stateJPM.findMany.data.map((item) => ({
          year: Number(item.year),
          totalPoorPopulation: Number(item.totalPoorPopulation),
        }))
      );
    }
  }, [stateJPM.findMany.data]);

  const filteredData = data || [];

  const handleDelete = () => {
    if (selectedId) {
      stateJPM.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      stateJPM.findMany.load();
    }
  };

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py={{ base: 'sm', md: 'md' }} gap='lg'>
      {/* Main Table/Card Section */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Jumlah Penduduk Miskin
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/jumlah-penduduk-miskin/create')
            }
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
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Tahun
                  </Text>
                </TableTh>
                <TableTh style={{ width: '35%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Jumlah Penduduk Miskin
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Edit
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Delete
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.year}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.totalPoorPopulation}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/ekonomi/jumlah-penduduk-miskin/${item.id}`)
                        }
                      >
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="red"
                        disabled={stateJPM.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
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
        <Stack hiddenFrom="md" gap="xs">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="sm">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Tahun
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.year}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Jumlah Penduduk Miskin
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.totalPoorPopulation}
                    </Text>
                  </Box>
                  <Group justify="flex-end" mt="xs">
                    <Button
                      variant="light"
                      color="green"
                      size="xs"
                      onClick={() =>
                        router.push(`/admin/ekonomi/jumlah-penduduk-miskin/${item.id}`)
                      }
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      disabled={stateJPM.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data yang cocok
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
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>

      {/* Bar Chart */}
      <Paper bg={colors['white-1']} p={{ base: 'sm', md: 'md' }} mt="lg" withBorder radius="md">
        <Stack gap="xs">
          <Title order={4} lh={1.2} mb="sm">
            Grafik Jumlah Penduduk Miskin
          </Title>
          {mounted && chartData.length > 0 ? (
            <BarChart
              h={300}
              data={chartData.map((item) => ({
                name: item.year.toString(),
                value: item.totalPoorPopulation,
              }))}
              dataKey="name"
              series={[{ name: 'value', color: colors['blue-button'] }]}
              withTooltip
              valueFormatter={(v) => `${v.toLocaleString()} jiwa`}
            />
          ) : (
            <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
              Belum ada data untuk ditampilkan dalam grafik
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus data ini?"
      />
    </Stack>
  );
}

export default JumlahPendudukMiskin;