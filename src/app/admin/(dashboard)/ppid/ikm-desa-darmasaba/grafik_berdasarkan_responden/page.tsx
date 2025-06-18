'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useSnapshot } from 'valtio';
import JudulListTab from '../../../_com/jusulListTab';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikBerdasarkanResponden from '../../../_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanResponden';

function GrafikBerdasarkanResponden() {

  const stategrafikBerdasarkanResponden = useSnapshot(grafikBerdasarkanResponden)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();

  const handleDelete = async () => {
    if (selectedId) {
      await stategrafikBerdasarkanResponden.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
  
      // Refresh data agar chart & tabel ikut update
      stategrafikBerdasarkanResponden.findMany.load();
    }
  }
  

  useShallowEffect(() => {
    setMounted(true)
    stategrafikBerdasarkanResponden.findMany.load()
  }, [])

  useEffect(() => {
    if (stategrafikBerdasarkanResponden.findMany.data) {
      const totalSangatBaik = stategrafikBerdasarkanResponden.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.sangatbaik || 0), 0);
      const totalBaik = stategrafikBerdasarkanResponden.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.baik || 0), 0);
      const totalKurangBaik = stategrafikBerdasarkanResponden.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.kurangbaik || 0), 0);
      const totalTidakBaik = stategrafikBerdasarkanResponden.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.tidakbaik || 0), 0);
      setDonutData([
        { name: 'sangatbaik', value: totalSangatBaik, color: colors['blue-button'], key: 'sangatbaik' },
        { name: 'baik', value: totalBaik, color: '#10A85AFF', key: 'baik' },
        { name: 'kurangbaik', value: totalKurangBaik, color: '#B3AA12FF', key: 'kurangbaik' },
        { name: 'tidakbaik', value: totalTidakBaik, color: '#B21313FF', key: 'tidakbaik' }
      ]);
    }

  }, [stategrafikBerdasarkanResponden.findMany.data])

  if (!stategrafikBerdasarkanResponden.findMany.data) {
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
            title='List Grafik Berdasarkan Pilihan Responden'
            href='/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_responden/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Sangat Baik</TableTh>
                <TableTh>Baik</TableTh>
                <TableTh>Kurang Baik</TableTh>
                <TableTh>Tidak Baik</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {stategrafikBerdasarkanResponden.findMany.data.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Text ta='center' c='dimmed'>Belum ada data grafik responden</Text>
                  </TableTd>
                </TableTr>
              ) : (
                stategrafikBerdasarkanResponden.findMany.data.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.sangatbaik}</TableTd>
                    <TableTd>{item.baik}</TableTd>
                    <TableTd>{item.kurangbaik}</TableTd>
                    <TableTd>{item.tidakbaik}</TableTd>
                    <TableTd>
                      <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/grafik_berdasarkan_responden/${item.id}`)}>
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color='red'
                        disabled={stategrafikBerdasarkanResponden.delete.loading}
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
                  <Text>Sangat Baik: {donutData.find((entry) => entry.name === 'sangatbaik')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#10A85AFF'} w={20} h={20} />
                  <Text>Baik: {donutData.find((entry) => entry.name === 'baik')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#B3AA12FF'} w={20} h={20} />
                  <Text>Kurang Baik: {donutData.find((entry) => entry.name === 'kurangbaik')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={'#B21313FF'} w={20} h={20} />
                  <Text>Tidak Baik: {donutData.find((entry) => entry.name === 'tidakbaik')?.value}</Text>
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

export default GrafikBerdasarkanResponden;
