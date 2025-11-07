/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import {
  Box,
  Button,
  Center,
  Flex,
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
import demografiPekerjaan from '../../_state/ekonomi/demografi-pekerjaan';

function DemografiPekerjaan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Demografi Pekerjaan'
        placeholder='Cari pekerjaan atau jumlah pekerja...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDemografiPekerjaan search={search} />
    </Box>
  );
}

function ListDemografiPekerjaan({ search }: { search: string }) {
  type DemografiPekerjaan = {
    id: string;
    pekerjaan: string;
    lakiLaki: number;
    perempuan: number;
  };

  const router = useRouter();
  const stateDemografi = useProxy(demografiPekerjaan);
  const [chartData, setChartData] = useState<DemografiPekerjaan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateDemografi.findMany;

  const handleDelete = () => {
    if (selectedId) {
      stateDemografi.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, search);
  }, [page, search]);

  useEffect(() => {
    if (data) {
      setChartData(
        data.map((item: any) => ({
          id: item.id,
          pekerjaan: item.pekerjaan,
          lakiLaki: Number(item.lakiLaki),
          perempuan: Number(item.perempuan),
        }))
      );
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
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Demografi Pekerjaan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/demografi-pekerjaan/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ minWidth: 200 }}>Pekerjaan</TableTh>
                <TableTh style={{ minWidth: 200 }}>Laki - Laki</TableTh>
                <TableTh style={{ minWidth: 200 }}>Perempuan</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ minWidth: 200 }}>{item.pekerjaan}</TableTd>
                    <TableTd style={{ minWidth: 200 }}>{item.lakiLaki}</TableTd>
                    <TableTd style={{ minWidth: 200 }}>{item.perempuan}</TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/ekonomi/demografi-pekerjaan/${item.id}`)
                        }
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="red"
                        disabled={stateDemografi.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={18} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data demografi pekerjaan yang cocok</Text>
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
            load(newPage, 10, search);
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
      <Box mt={30} style={{ width: '100%', minHeight: 400 }}>
        <Paper bg={colors['white-1']} p="md" radius="md" withBorder>
          <Stack gap={"xs"}>
            <Title pb={10} order={4}>
              Grafik Demografi Pekerjaan
            </Title>
            {mounted && chartData.length > 0 ? (
              <BarChart
                h={450}
                data={chartData}
                dataKey="pekerjaan"
                type="stacked"
                series={[
                  { name: 'lakiLaki', color: '#5082EE', label: 'Laki - Laki' },
                  { name: 'perempuan', color: '#6EDF9C', label: 'Perempuan' },
                ]}
              />
            ) : (
              <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
            )}
            <Box py={10}>
              <Group justify='center'>
                <Flex align="center" gap={10}>
                  <Box bg="#5082EE" w={20} h={20} />
                  <Text>Laki - Laki</Text>
                </Flex>
                <Flex align="center" gap={10}>
                  <Box bg="#6EDF9C" w={20} h={20} />
                  <Text>Perempuan</Text>
                </Flex>
              </Group>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus demografi pekerjaan ini?"
      />
    </Box>
  );
}

export default DemografiPekerjaan;
