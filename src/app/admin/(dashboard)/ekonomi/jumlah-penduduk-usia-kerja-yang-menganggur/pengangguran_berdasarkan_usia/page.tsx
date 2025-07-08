/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';
import JudulListTab from '../../../_com/jusulListTab';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikNganggur from '../../../_state/ekonomi/usia-kerja-nganggur';

function GrafikBerdasarkanUsiaKerjaYangMenganggur() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>Grafik Pengangguran Berdasarkan Usia Kerja</Title>
        <ListGrafikBerdasarkanUsiaKerjaYangMenganggur />
      </Stack>
    </Box>
  );
}

function ListGrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();
  const [search, setSearch] = useState("");


  const handleDelete = async () => {
    if (selectedId) {
      await stategrafik.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stategrafik.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true);
    stategrafik.findMany.load()
  }, []);

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
  }, [stategrafik.findMany.data])

  const filteredData = (stategrafik.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.usia18_25.toString().toLowerCase().includes(keyword) ||
      item.usia26_35.toString().toLowerCase().includes(keyword) ||
      item.usia36_45.toString().toLowerCase().includes(keyword) ||
      item.usia46_keatas.toString().toLowerCase().includes(keyword)
    );
  });

  if (!stategrafik.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={"md"}>
          <JudulListTab
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            title='List Pengangguran Berdasarkan Usia Kerja'
            href='/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
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
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Text ta='center' c='dimmed'>Belum ada data grafik responden</Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.usia18_25}</TableTd>
                    <TableTd>{item.usia26_35}</TableTd>
                    <TableTd>{item.usia36_45}</TableTd>
                    <TableTd>{item.usia46_keatas}</TableTd>
                    <TableTd>
                      <Button color='green' onClick={() => router.push(`/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/${item.id}`)}>
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color='red'
                        disabled={stategrafik.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id)
                          setModalHapus(true)
                        }}>
                        <IconTrash size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>

          </Table>
        </Paper>

        {/* Chart */}
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title pb={10} order={3}>Grafik Pengangguran Berdasarkan Usia Kerja</Title>
              {mounted && donutData.length > 0 ? (<Box style={{ width: '100%', height: 'auto', minHeight: 200 }}>
                <PieChart
                  width={800} height={300}
                  data={donutData}
                >
                  <Pie
                    dataKey="value"
                    nameKey="name"
                    data={donutData}
                    cx={500}
                    cy={150}
                    innerRadius={60}
                    outerRadius={115}
                    label={true}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={colors['blue-button']} w={20} h={20} />
                  <Text>Usia 18-25 : {donutData.find((entry) => entry.name === 'usia18_25')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#10A85AFF'} w={20} h={20} />
                  <Text>Usia 26-35 : {donutData.find((entry) => entry.name === 'usia26_35')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#C07B13FF'} w={20} h={20} />
                  <Text>Usia 36-45 : {donutData.find((entry) => entry.name === 'usia36_45')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#1094A8FF'} w={20} h={20} />
                  <Text>Usia 46 + : {donutData.find((entry) => entry.name === 'usia46_keatas')?.value}</Text>
                </Flex>
              </Box>
              ) : (
                <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
              )}
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus grafik pengangguran berdasarkan usia kerja ini?'
      />
    </Box>
  );
}

export default GrafikBerdasarkanUsiaKerjaYangMenganggur;
