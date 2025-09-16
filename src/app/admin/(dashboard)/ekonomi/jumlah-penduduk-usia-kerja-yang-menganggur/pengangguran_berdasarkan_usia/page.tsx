/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikNganggur from '../../../_state/ekonomi/usia-kerja-nganggur';

function GrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Detail Data Pengangguran'
        placeholder='Cari usia...'
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
  const [mounted, setMounted] = useState(false);
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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stategrafik.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, search)
  }, [page, search]);

  useEffect(() => {
    if (stategrafik.findMany.data) {
      const totalUsia18_25 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia18_25 || 0), 0);
      const totalUsia26_35 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia26_35 || 0), 0);
      const totalUsia36_45 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia36_45 || 0), 0);
      const totalUsia46_keatas = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia46_keatas || 0), 0);
      setDonutData([
        { name: 'usia18_25', value: totalUsia18_25, color: colors['blue-button'], key: 'usia18_25' },
        { name: 'usia26_35', value: totalUsia26_35, color: '#10A85AFF', key: 'usia26_35' },
        { name: 'usia36_45', value: totalUsia36_45, color: '#C07B13FF', key: 'usia36_45' },
        { name: 'usia46_keatas', value: totalUsia46_keatas, color: '#1094A8FF', key: 'usia46_keatas' },
      ]);
    }
  }, [stategrafik.findMany.data]);

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Stack>
          {/* Header */}
          <Flex justify="space-between" align="center" mb="md">
            <Title order={4}>List Pengangguran Berdasarkan Usia Kerja</Title>
            <Tooltip label="Tambah Data" withArrow>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() => router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/create')}
              >
                Tambah Baru
              </Button>
            </Tooltip>
          </Flex>

          {/* Table */}
          <Box style={{ overflowX: 'auto' }}>
            <Table highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Usia 18-25</TableTh>
                  <TableTh>Usia 26-35</TableTh>
                  <TableTh>Usia 36-45</TableTh>
                  <TableTh>Usia 46 +</TableTh>
                  <TableTh>Edit</TableTh>
                  <TableTh>Delete</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map(item => (
                    <TableTr key={item.id}>
                      <TableTd>{item.usia18_25}</TableTd>
                      <TableTd>{item.usia26_35}</TableTd>
                      <TableTd>{item.usia36_45}</TableTd>
                      <TableTd>{item.usia46_keatas}</TableTd>
                      <TableTd>
                        <Button color="green" onClick={() => router.push(`/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/${item.id}`)}>
                          <IconEdit size={20} />
                        </Button>
                      </TableTd>
                      <TableTd>
                        <Button color="red" disabled={stategrafik.delete.loading} onClick={() => { setSelectedId(item.id); setModalHapus(true); }}>
                          <IconTrash size={20} />
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={6}>
                      <Center py={20}>
                        <Text color="dimmed">Belum ada data grafik responden</Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>

        </Stack>
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
      <Paper bg={colors['white-1']} p="md" mt="lg" withBorder radius="md">
        <Stack>
          <Title order={3} pb={10}>Grafik Pengangguran Berdasarkan Usia Kerja</Title>
          {mounted && donutData.length > 0 ? (
            <Box style={{ width: '100%', height: 'auto', minHeight: 200 }}>
              <PieChart width={800} height={300} data={donutData}>
                <Pie dataKey="value" nameKey="name" data={donutData} cx={400} cy={150} innerRadius={60} outerRadius={115} label>
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <Stack mt="sm" gap="xs">
                <Flex gap={"md"} align={"center"}>
                  <Box bg={colors['blue-button']} w={20} h={20} />
                  <Text>Usia 18-25 : {donutData.find((entry) => entry.name === 'usia18_25')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#10A85AFF'} w={20} h={20} />
                  <Text>Usia 26-35 : {donutData.find((entry) => entry.name === 'usia26_35')?.value}
                  </Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#C07B13FF'} w={20} h={20} />
                  <Text>Usia 36-45 : {donutData.find((entry) => entry.name === 'usia36_45')?.value}
                  </Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#1094A8FF'} w={20} h={20} />
                  <Text>Usia 46 + : {donutData.find((entry) => entry.name === 'usia46_keatas')?.value}
                  </Text>
                </Flex>
              </Stack>
            </Box>
          ) : (
            <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
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
