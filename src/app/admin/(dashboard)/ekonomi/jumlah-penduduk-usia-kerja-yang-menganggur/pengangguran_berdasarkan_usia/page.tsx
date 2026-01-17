/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import colors from '@/con/colors';
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
  Title,
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { DonutChart } from '@mantine/charts';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikNganggur from '../../../_state/ekonomi/usia-kerja-nganggur';

function GrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Detail Data Pengangguran"
        placeholder="Cari usia..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGrafikBerdasarkanUsiaKerjaYangMenganggur search={search} />
    </Box>
  );
}

function ListGrafikBerdasarkanUsiaKerjaYangMenganggur({ search }: { search: string }) {
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur);
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
      const totalUsia18_25 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia18_25 || 0), 0);
      const totalUsia26_35 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia26_35 || 0), 0);
      const totalUsia36_45 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia36_45 || 0), 0);
      const totalUsia46_keatas = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia46_keatas || 0), 0);

      setDonutData([
        { name: 'Usia 18-25', value: totalUsia18_25, color: colors['blue-button'] },
        { name: 'Usia 26-35', value: totalUsia26_35, color: '#10A85AFF' },
        { name: 'Usia 36-45', value: totalUsia36_45, color: '#C07B13FF' },
        { name: 'Usia 46+', value: totalUsia46_keatas, color: '#1094A8FF' },
      ]);
    }
  }, [stategrafik.findMany.data]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      {/* Table - Desktop */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md" mb="lg">
        <Stack gap="md">
          <Flex justify="space-between" align="center" visibleFrom='md'>
            <Title order={4} lh={1.2}>
              List Pengangguran Berdasarkan Usia Kerja
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/create')
              }
            >
              Tambah Baru
            </Button>
          </Flex>

          <Group align="center" hiddenFrom='md'>
            <Title order={4} lh={1.2}>
              List Pengangguran Berdasarkan Usia Kerja
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/create')
              }
            >
              Tambah Baru
            </Button>
          </Group>

          {/* Desktop Table */}
         <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
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
                  <TableTh style={{ width: '20%' }}>Usia 18-25</TableTh>
                  <TableTh style={{ width: '20%' }}>Usia 26-35</TableTh>
                  <TableTh style={{ width: '20%' }}>Usia 36-45</TableTh>
                  <TableTh style={{ width: '20%' }}>Usia 46+</TableTh>
                  <TableTh style={{ width: '10%' }}>Edit</TableTh>
                  <TableTh style={{ width: '10%' }}>Delete</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd fz="md" fw={500} lh={1.5}>
                        {item.usia18_25}
                      </TableTd>
                      <TableTd fz="md" fw={500} lh={1.5}>
                        {item.usia26_35}
                      </TableTd>
                      <TableTd fz="md" fw={500} lh={1.5}>
                        {item.usia36_45}
                      </TableTd>
                      <TableTd fz="md" fw={500} lh={1.5}>
                        {item.usia46_keatas}
                      </TableTd>
                      <TableTd>
                        <Button
                          color="green"
                          onClick={() =>
                            router.push(`/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/${item.id}`)
                          }
                        >
                          <IconEdit size={20} />
                        </Button>
                      </TableTd>
                      <TableTd>
                        <Button
                          color="red"
                          disabled={stategrafik.delete.loading}
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
                    <TableTd colSpan={6}>
                      <Center py={20}>
                        <Text c="dimmed" fz="sm" lh={1.4}>
                          Belum ada data grafik responden
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
            {filteredData.length > 0 ? (
              <Stack gap="xs">
                {filteredData.map((item) => (
                  <Paper key={item.id} withBorder p="sm" radius="sm">
                    <Stack gap={"xs"}>
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>
                          Usia 18-25
                        </Text>
                        <Text fz="sm" fw={500} lh={1.4}>
                          {item.usia18_25}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>
                          Usia 26-35
                        </Text>
                        <Text fz="sm" fw={500} lh={1.4}>
                          {item.usia26_35}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>
                          Usia 36-45
                        </Text>
                        <Text fz="sm" fw={500} lh={1.4}>
                          {item.usia36_45}
                        </Text>
                      </Box>
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>
                          Usia 46+
                        </Text>
                        <Text fz="sm" fw={500} lh={1.4}>
                          {item.usia46_keatas}
                        </Text>
                      </Box>
                      <Flex gap="xs" mt="xs">
                        <Button
                          size="xs"
                          color="green"
                          onClick={() =>
                            router.push(`/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/${item.id}`)
                          }
                        >
                          <IconEdit size={16} />
                        </Button>
                        <Button
                          size="xs"
                          color="red"
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
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Belum ada data grafik responden
                </Text>
              </Center>
            )}
          </Box>
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

      {/* Donut Chart */}
      <Paper bg={colors['white-1']} p="md" mt="lg" withBorder radius="md">
        <Stack gap="md">
          <Title order={4} lh={1.2}>
            Grafik Pengangguran Berdasarkan Usia Kerja
          </Title>
          {donutData.length > 0 ? (
            <Center>
              <DonutChart
                data={donutData}
                withLabels
                withTooltip
                size={200}
                thickness={40}
                tooltipDataSource="segment"
              />
            </Center>
          ) : (
            <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
              Belum ada data untuk ditampilkan dalam grafik
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus grafik pengangguran berdasarkan usia kerja ini?"
      />
    </Box>
  );
}

export default GrafikBerdasarkanUsiaKerjaYangMenganggur;