/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { DonutChart } from '@mantine/charts';
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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikNganggur from '../../../_state/ekonomi/usia-kerja-nganggur';

function GrafikBerdasarkanPendidikan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Detail Data Pengangguran Berdasarkan Pendidikan"
        placeholder="Cari data pendidikan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGrafikBerdasarkanPendidikan search={search} />
    </Box>
  );
}

function ListGrafikBerdasarkanPendidikan({ search }: { search: string }) {
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan);
  const [donutData, setDonutData] = useState<any[]>([]);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const handleDelete = async () => {
    if (selectedId) {
      await stategrafik.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      stategrafik.findMany.load();
    }
  };

  const { data, page, totalPages, loading, load } = stategrafik.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (stategrafik.findMany.data) {
      const SD = stategrafik.findMany.data.reduce(
        (acc: number, cur: any) => acc + Number(cur.SD || 0),
        0,
      );
      const SMP = stategrafik.findMany.data.reduce(
        (acc: number, cur: any) => acc + Number(cur.SMP || 0),
        0,
      );
      const SMA = stategrafik.findMany.data.reduce(
        (acc: number, cur: any) => acc + Number(cur.SMA || 0),
        0,
      );
      const D3 = stategrafik.findMany.data.reduce(
        (acc: number, cur: any) => acc + Number(cur.D3 || 0),
        0,
      );
      const S1 = stategrafik.findMany.data.reduce(
        (acc: number, cur: any) => acc + Number(cur.S1 || 0),
        0,
      );
      setDonutData([
        { name: 'SD', value: SD, color: '#4b6Ef5' },
        { name: 'SMP', value: SMP, color: '#14b885' },
        { name: 'SMA', value: SMA, color: '#E6A03B' },
        { name: 'D3', value: D3, color: '#DB524D' },
        { name: 'S1', value: S1, color: '#1018A8FF' },
      ]);
    }
  }, [stategrafik.findMany.data]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'lg' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack py={{ base: 'sm', md: 'lg' }} gap='md'>
      {/* Section: List Table */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Flex visibleFrom='md' justify="space-between" align="center" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            List Pengangguran Berdasarkan Pendidikan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/create',
              )
            }
          >
            Tambah Baru
          </Button>
        </Flex>

        <Group hiddenFrom='md' align="center" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            List Pengangguran Berdasarkan Pendidikan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/create',
              )
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
                <TableTh style={{ width: '16%' }}>SD</TableTh>
                <TableTh style={{ width: '16%' }}>SMP</TableTh>
                <TableTh style={{ width: '16%' }}>SMA</TableTh>
                <TableTh style={{ width: '16%' }}>D3</TableTh>
                <TableTh style={{ width: '16%' }}>S1</TableTh>
                <TableTh style={{ width: '10%' }}>Edit</TableTh>
                <TableTh style={{ width: '10%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={7}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Belum ada data grafik responden
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.SD}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.SMP}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.SMA}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.D3}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5}>
                        {item.S1}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="green"
                        variant="light"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/${item.id}`,
                          )
                        }
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="red"
                        variant="light"
                        disabled={stategrafik.delete.loading}
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
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          {filteredData.length === 0 ? (
            <Center py="sm">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Belum ada data grafik responden
              </Text>
            </Center>
          ) : (
            <Stack gap="sm">
              {filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        SD
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.SD}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        SMP
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.SMP}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        SMA
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.SMA}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        D3
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.D3}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        S1
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.S1}
                      </Text>
                    </Box>
                    <Flex gap="xs" mt="xs">
                      <Button
                        size="compact-sm"
                        color="green"
                        variant="light"
                        onClick={() =>
                          router.push(
                            `/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/${item.id}`,
                          )
                        }
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        size="compact-sm"
                        color="red"
                        variant="light"
                        disabled={stategrafik.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </Flex>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
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

      {/* Section: Donut Chart */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'sm', md: 'lg' }} shadow="md" radius="md">
        <Stack gap="md">
          <Title order={4} lh={1.2}>
            Grafik Pengangguran Berdasarkan Pendidikan
          </Title>
          <Center>
            {donutData.length > 0 ? (
              <DonutChart
                data={donutData}
                withLabels
                withTooltip
                tooltipDataSource="segment"
                size={260}
                thickness={40}
              />
            ) : (
              <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
                Belum ada data untuk ditampilkan dalam grafik
              </Text>
            )}
          </Center>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus grafik pengangguran berdasarkan pendidikan ini?"
      />
    </Stack>
  );
}

export default GrafikBerdasarkanPendidikan;