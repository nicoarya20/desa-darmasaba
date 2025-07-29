'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import dataPendidikan from '../../_state/pendidikan/data-pendidikan';

function DataPendidikan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Data Pendidikan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDataPendidikan search={search} />
    </Box>
  );
}

function ListDataPendidikan({ search }: { search: string }) {
  type DPMrafik = {
    id: string;
    name: string;
    jumlah: number;
  }
  const stateDPM = useProxy(dataPendidikan);
  const [chartData, setChartData] = useState<DPMrafik[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();

  const handleDelete = () => {
    if (selectedId) {
      stateDPM.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateDPM.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true)
    stateDPM.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (stateDPM.findMany.data) {
      setChartData(stateDPM.findMany.data.map((item) => ({
        id: item.id,
        name: item.name,
        jumlah: Number(item.jumlah)
      })));
    }
  }, [stateDPM.findMany.data]);

  const filteredData = (stateDPM.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.jumlah.toLowerCase().includes(keyword)
    );
  });

  if (!stateDPM.findMany.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Stack gap={'xs'}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Data Pendidikan'
            href='/admin/pendidikan/data-pendidikan/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Jumlah</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.jumlah}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/pendidikan/data-pendidikan/${item.id}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      color='red'
                      disabled={stateDPM.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id)
                        setModalHapus(true)
                      }}>
                      <IconTrash size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Paper>

        {/* Chart */}
        {!mounted && !chartData ? (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={3}>Grafik Data Pendidikan</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Grafik Data Pendidikan</Title>
              {mounted && chartData.length > 0 && (
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={chartData} >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="jumlah" fill={colors['blue-button']} name="Data Pendidikan" />
                </BarChart>
              )}
            </Paper>
          </Box>
        )}
      </Stack>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus grafik data pendidikan ini?'
      />
    </Box>
  );
}

export default DataPendidikan;
