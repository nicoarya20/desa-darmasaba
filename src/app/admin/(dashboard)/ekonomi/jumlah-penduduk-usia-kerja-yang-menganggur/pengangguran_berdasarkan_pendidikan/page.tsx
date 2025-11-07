/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { DonutChart } from '@mantine/charts';
import {
  Box,
  Button,
  Center,
  Flex,
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
    load(page, 10, search);
  }, [page, search]);

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
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      {/* Table Data */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Flex justify="space-between" align="center" mb="md">
          <Title order={4}>List Pengangguran Berdasarkan Pendidikan</Title>
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

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>SD</TableTh>
                <TableTh>SMP</TableTh>
                <TableTh>SMA</TableTh>
                <TableTh>D3</TableTh>
                <TableTh>S1</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={7}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Belum ada data grafik responden
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.SD}</TableTd>
                    <TableTd>{item.SMP}</TableTd>
                    <TableTd>{item.SMA}</TableTd>
                    <TableTd>{item.D3}</TableTd>
                    <TableTd>{item.S1}</TableTd>
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
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md" mt="md">
        <Stack>
          <Title order={3} pb={10}>
            Grafik Pengangguran Berdasarkan Pendidikan
          </Title>
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
            <Text color="dimmed">
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
        text="Apakah anda yakin ingin menghapus grafik pengangguran berdasarkan pendidikan ini?"
      />
    </Box>
  );
}

export default GrafikBerdasarkanPendidikan;
