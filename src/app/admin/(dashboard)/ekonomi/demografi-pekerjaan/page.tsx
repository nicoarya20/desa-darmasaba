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
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.15 }}
          >
            List Demografi Pekerjaan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/demografi-pekerjaan/create')}
            fz={{ base: 'sm', md: 'md' }}
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
                <TableTh style={{ width: '40%' }}>Pekerjaan</TableTh>
                <TableTh style={{ width: '20%' }}>Laki - Laki</TableTh>
                <TableTh style={{ width: '20%' }}>Perempuan</TableTh>
                <TableTh style={{ width: '10%' }}>Edit</TableTh>
                <TableTh style={{ width: '10%' }}>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.pekerjaan}</TableTd>
                    <TableTd>{item.lakiLaki}</TableTd>
                    <TableTd>{item.perempuan}</TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/ekonomi/demografi-pekerjaan/${item.id}`)
                        }
                        fz="sm"
                        px="xs"
                        py="xs"
                      >
                        <IconEdit size={16} />
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
                        fz="sm"
                        px="xs"
                        py="xs"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data demografi pekerjaan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card */}
        <Box hiddenFrom="md">
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Pekerjaan
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.pekerjaan}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Laki - Laki
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.lakiLaki}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Perempuan
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.perempuan}
                      </Text>
                    </Box>
                    <Group justify="flex-end" gap="xs">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/ekonomi/demografi-pekerjaan/${item.id}`)
                        }
                        fz="xs"
                        px="xs"
                        py="xs"
                      >
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        disabled={stateDemografi.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                        fz="xs"
                        px="xs"
                        py="xs"
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data demografi pekerjaan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
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
      <Box mt={{ base: 'lg', md: 'xl' }}>
        <Paper bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} radius="md" withBorder>
          <Stack gap="xs">
            <Title
              order={4}
              lh={{ base: 1.2, md: 1.15 }}
            >
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
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} lh={1.4}>
                Belum ada data untuk ditampilkan dalam grafik
              </Text>
            )}
            <Box py={{ base: 'sm', md: 'md' }}>
              <Group justify="center" gap='md'>
                <Flex align="center" gap={8}>
                  <Box bg="#5082EE" w={16} h={16} />
                  <Text fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
                    Laki - Laki
                  </Text>
                </Flex>
                <Flex align="center" gap={8}>
                  <Box bg="#6EDF9C" w={16} h={16} />
                  <Text fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
                    Perempuan
                  </Text>
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