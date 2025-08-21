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
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikNganggur from '../../../_state/ekonomi/usia-kerja-nganggur';

function GrafikBerdasarkanPendidikan() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <Stack gap={"xs"}>
      <HeaderSearch
        title='Detail Data Pengangguran Berdasarkan Pendidikan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
        <ListGrafikBerdasarkanPendidikan search={search}/>
      </Stack>
    </Box>
  );
}

function ListGrafikBerdasarkanPendidikan({search}: {search: string}) {
  const stategrafik = useProxy(grafikNganggur.grafikBerdasarkanPendidikan)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();


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
      const SD = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.SD || 0), 0);
      const SMP = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.SMP || 0), 0);
      const SMA = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.SMA || 0), 0);
      const D3 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.D3 || 0), 0);
      const S1 = stategrafik.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.S1 || 0), 0);
      setDonutData([
        { name: 'SD', value: SD, color: '#4b6Ef5', key: 'SD' },
        { name: 'SMP', value: SMP, color: '#14b885', key: 'SMP' },
        { name: 'SMA', value: SMA, color: '#E6A03B', key: 'SMA' },
        { name: 'D3', value: D3, color: '#DB524D', key: 'D3' },
        { name: 'S1', value: S1, color: '#1018A8FF', key: 'S1' },
      ]);
    }
  }, [stategrafik.findMany.data])

  const filteredData = (stategrafik.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.SD.toString().toLowerCase().includes(keyword) ||
      item.SMP.toString().toLowerCase().includes(keyword) ||
      item.SMA.toString().toLowerCase().includes(keyword) ||
      item.D3.toString().toLowerCase().includes(keyword) ||
      item.S1.toString().toLowerCase().includes(keyword)
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
          <JudulList
            title='List Grafik Pengangguran Berdasarkan Pendidikan'
            href='/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/create'
          />
          <Table striped withTableBorder withRowBorders>
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
                  <TableTd colSpan={6}>
                    <Text ta='center' c='dimmed'>Belum ada data grafik responden</Text>
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
                      <Button color='green' onClick={() => router.push(`/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/${item.id}`)}>
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
              <Title pb={10} order={3}>Grafik Pengangguran Berdasarkan Pendidikan</Title>
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
                  <Text>SD : {donutData.find((entry) => entry.name === 'SD')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#10A85AFF'} w={20} h={20} />
                  <Text>SMP : {donutData.find((entry) => entry.name === 'SMP')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#C07B13FF'} w={20} h={20} />
                  <Text>SMA : {donutData.find((entry) => entry.name === 'SMA')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#1094A8FF'} w={20} h={20} />
                  <Text>D3 : {donutData.find((entry) => entry.name === 'D3')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#A83610FF'} w={20} h={20} />
                  <Text>S1 : {donutData.find((entry) => entry.name === 'S1')?.value}</Text>
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
        text='Apakah anda yakin ingin menghapus grafik pengangguran berdasarkan pendidikan ini?'
      />
    </Box>
  );
}

export default GrafikBerdasarkanPendidikan;
