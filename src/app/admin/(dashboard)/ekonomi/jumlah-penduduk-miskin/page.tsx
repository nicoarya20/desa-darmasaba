'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import jumlahPendudukMiskin from '../../_state/ekonomi/jumlah-penduduk-miskin';
import { Bar, BarChart, Legend, XAxis, YAxis, Tooltip } from 'recharts';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';

function JumlahPendudukMiskin() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Jumlah Penduduk Miskin'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListJumlahPendudukMiskin search={search} />
    </Box>
  );
}

function ListJumlahPendudukMiskin({ search }: { search: string }) {
  type JPMGrafik = {
    id: string;
    year: number;
    totalPoorPopulation: number;
  }
  const stateJPM = useProxy(jumlahPendudukMiskin);
  const [chartData, setChartData] = useState<JPMGrafik[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();

  const handleDelete = () => {
    if (selectedId) {
      stateJPM.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateJPM.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true)
    stateJPM.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (stateJPM.findMany.data) {
      setChartData(stateJPM.findMany.data.map((item) => ({
        id: item.id,
        year: Number(item.year),
        totalPoorPopulation: Number(item.totalPoorPopulation),
      })));
    }
  }, [stateJPM.findMany.data]);

  const filteredData = (stateJPM.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.year.toString().toLowerCase().includes(keyword) ||
      item.totalPoorPopulation.toString().toLowerCase().includes(keyword)
    );
  });

  if (!stateJPM.findMany.data) {
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
            title='List Jumlah Penduduk Miskin'
            href='/admin/ekonomi/jumlah-penduduk-miskin-2024-2025/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Tahun</TableTh>
                <TableTh>Jumlah Penduduk Miskin</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.year}</TableTd>
                  <TableTd>{item.totalPoorPopulation}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/ekonomi/jumlah-penduduk-miskin-2024-2025/${item.id}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      color='red'
                      disabled={stateJPM.delete.loading}
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
              <Title pb={10} order={3}>Grafik Jumlah Penduduk Miskin</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Grafik Jumlah Penduduk Miskin</Title>
              {mounted && chartData.length > 0 && (
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={chartData} >
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPoorPopulation" fill={colors['blue-button']} name="Jumlah Penduduk Miskin" />
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
        text='Apakah anda yakin ingin menghapus grafik jumlah penduduk miskin ini?'
      />
    </Box>
  );
}

export default JumlahPendudukMiskin;
