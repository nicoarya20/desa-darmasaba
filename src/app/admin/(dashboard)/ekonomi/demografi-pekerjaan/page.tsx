'use client'
import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import demografiPekerjaan from '../../_state/ekonomi/demografi-pekerjaan';

function DemografiPekerjaan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Demografi Pekerjaan'
        placeholder='pencarian'
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
  }

  const router = useRouter();
  const stateDemografi = useProxy(demografiPekerjaan)
  const [chartData, setChartData] = useState<DemografiPekerjaan[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDelete = () => {
    if (selectedId) {
      stateDemografi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateDemografi.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true)
    stateDemografi.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (stateDemografi.findMany.data) {
      setChartData(stateDemografi.findMany.data.map((item) => ({
        id: item.id,
        pekerjaan: item.pekerjaan,
        lakiLaki: Number(item.lakiLaki),
        perempuan: Number(item.perempuan),
      })));
    }
  }, [stateDemografi.findMany.data]);

  const filteredData = (stateDemografi.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.pekerjaan.toLowerCase().includes(keyword) ||
      item.lakiLaki.toString().toLowerCase().includes(keyword) ||
      item.perempuan.toString().toLowerCase().includes(keyword)
    );
  });
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Demografi Pekerjaan'
          href='/admin/ekonomi/demografi-pekerjaan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Pekerjaan</TableTh>
              <TableTh>Jumlah Pekerja Laki - Laki</TableTh>
              <TableTh>Jumlah Pekerja Perempuan</TableTh>
              <TableTh>Edit</TableTh>
              <TableTh>Delete</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.pekerjaan}</TableTd>
                <TableTd>{item.lakiLaki}</TableTd>
                <TableTd>{item.perempuan}</TableTd>
                <TableTd>
                  <Button color='green' onClick={() => router.push(`/admin/ekonomi/demografi-pekerjaan/${item.id}`)}>
                    <IconEdit size={20} />
                  </Button>
                </TableTd>
                <TableTd>
                  <Button
                    color='red'
                    disabled={stateDemografi.delete.loading}
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
            <Title pb={10} order={3}>Data Kelahiran & Kematian</Title>
            <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
          </Paper>
        </Box>
      ) : (
        <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
          <Paper bg={colors['white-1']} p={'md'}>
            <Title pb={10} order={4}>Data Kelahiran & Kematian</Title>
            {mounted && chartData.length > 0 && (
              <Box w={{ base: '100%', md: '30%' }}>
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
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus demografi pekerjaan ini?'
      />
    </Box>
  );
}

export default DemografiPekerjaan;
