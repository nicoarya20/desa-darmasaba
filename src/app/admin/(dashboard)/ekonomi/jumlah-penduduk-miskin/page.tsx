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
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import jumlahPendudukMiskin from '../../_state/ekonomi/jumlah-penduduk-miskin';

// ✅ BarChart Mantine
import { BarChart } from '@mantine/charts';

function JumlahPendudukMiskin() {
  const [search, setSearch] = useState("");
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

  const { data, page, loading, load, totalPages } = stateJPM.findMany;

  // Load data awal
  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, search);
  }, [page, search]);

  // Update chart data
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
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      {/* Tabel */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Jumlah Penduduk Miskin</Title>
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

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Tahun</TableTh>
                <TableTh style={{ width: '35%' }}>Jumlah Penduduk Miskin</TableTh>
                <TableTh style={{ width: '20%' }}>Edit</TableTh>
                <TableTh style={{ width: '20%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.year}</TableTd>
                    <TableTd>{item.totalPoorPopulation}</TableTd>
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
                      <Text color="dimmed">Tidak ada data yang cocok</Text>
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

      {/* Bar Chart */}
      <Paper bg={colors['white-1']} p="md" mt="lg" withBorder radius="md">
        <Stack>
          <Title order={4} mb="sm">
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
              series={[
                { name: 'value', color: colors['blue-button'] },
              ]}
              withTooltip
              valueFormatter={(v) => `${v.toLocaleString()} jiwa`}
            />
          ) : (
            <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
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
    </Box>
  );
}

export default JumlahPendudukMiskin;
