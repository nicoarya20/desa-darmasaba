'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import grafikBerdasarkanUmur from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanUmur';
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
import HeaderSearch from '../../../_com/header';

function GrafikBerdasarakanUmur() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Grafik Berdasarkan Umur Responden'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGrafikBerdasarakanUmur search={search} />
    </Box>
  );
}

function ListGrafikBerdasarakanUmur({ search }: { search: string }) {
  const stategrafikBerdasarkanUmur = useProxy(grafikBerdasarkanUmur)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (selectedId) {
      await grafikBerdasarkanUmur.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stategrafikBerdasarkanUmur.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true);
    stategrafikBerdasarkanUmur.findMany.load()
  }, []);

  useEffect(() => {
    if (stategrafikBerdasarkanUmur.findMany.data) {
      const totalRemaja = stategrafikBerdasarkanUmur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.remaja || 0), 0);
      const totalDewasa = stategrafikBerdasarkanUmur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.dewasa || 0), 0);
      const totalOrangtua = stategrafikBerdasarkanUmur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.orangtua || 0), 0);
      const totalLansia = stategrafikBerdasarkanUmur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.lansia || 0), 0);
      setDonutData([
        { name: 'remaja', value: totalRemaja, color: colors['blue-button'], key: 'remaja' },
        { name: 'dewasa', value: totalDewasa, color: '#D32711FF', key: 'dewasa' },
        { name: 'orangtua', value: totalOrangtua, color: '#B46B04FF', key: 'orangtua' },
        { name: 'lansia', value: totalLansia, color: '#038617FF', key: 'lansia' }
      ]);
    }
  }, [stategrafikBerdasarkanUmur.findMany.data])

  const filteredData = (stategrafikBerdasarkanUmur.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.remaja.toString().toLowerCase().includes(keyword) ||
      item.dewasa.toString().toLowerCase().includes(keyword) ||
      item.orangtua.toString().toLowerCase().includes(keyword) ||
      item.lansia.toString().toLowerCase().includes(keyword)
    );
  });

  if (!stategrafikBerdasarkanUmur.findMany.data) {
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
            title='List Grafik Berdasarkan Umur Responden'
            href='/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_umur/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Remaja</TableTh>
                <TableTh>Dewasa</TableTh>
                <TableTh>Orangtua</TableTh>
                <TableTh>Lansia</TableTh>
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
                    <TableTd>{item.remaja}</TableTd>
                    <TableTd>{item.dewasa}</TableTd>
                    <TableTd>{item.orangtua}</TableTd>
                    <TableTd>{item.lansia}</TableTd>
                    <TableTd>
                      <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_umur/${item.id}`)}>
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color='red'
                        disabled={stategrafikBerdasarkanUmur.delete.loading}
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
              <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
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
                  <Text>Remaja: {donutData.find((entry) => entry.name === 'remaja')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#D32711FF'} w={20} h={20} />
                  <Text>Dewasa: {donutData.find((entry) => entry.name === 'dewasa')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#B46B04FF'} w={20} h={20} />
                  <Text>Orangtua: {donutData.find((entry) => entry.name === 'orangtua')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#038617FF'} w={20} h={20} />
                  <Text>Lansia: {donutData.find((entry) => entry.name === 'lansia')?.value}</Text>
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
        text='Apakah anda yakin ingin menghapus grafik berdasarkan hasil responden ini?'
      />
    </Box>
  );
}

export default GrafikBerdasarakanUmur;
