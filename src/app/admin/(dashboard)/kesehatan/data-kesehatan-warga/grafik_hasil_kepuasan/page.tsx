/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import grafikkepuasan from '../../../_state/kesehatan/data_kesehatan_warga/grafikKepuasan';

function GrafikHasilKepuasanMasyarakat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Grafik Hasil Kepuasan Masyarakat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGrafikHasilKepuasanMasyarakat search={search} />
    </Box>
  );
}
function ListGrafikHasilKepuasanMasyarakat({ search }: { search: string }) {
  type PDKMGrafik = {
    id: string;
    nama: string;
    tanggal: string | Date; // Allow both string and Date types
    jenisKelamin: string;
    alamat: string;
    penyakit: string;
    createdAt?: Date;     // Add optional fields that might come from the API
    updatedAt?: Date;
    deletedAt?: Date | null;
  }
  const stateGrafikKepuasan = useProxy(grafikkepuasan);
  const [chartData, setChartData] = useState<PDKMGrafik[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = stateGrafikKepuasan.findMany;

  useShallowEffect(() => {
    setMounted(true)
    load(page, 10, search)
  }, [page, search])

  useEffect(() => {
    setMounted(true);
    if (data) {
      setChartData(data.map((item) => ({
        id: item.id,
        nama: item.nama,
        tanggal: item.tanggal instanceof Date ? item.tanggal.toISOString() : item.tanggal,
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
        penyakit: item.penyakit,
      })));
    }
  }, [data]);

  // Add this function to process the data
  const processDiseaseData = (data: PDKMGrafik[]) => {
    const diseaseCount: Record<string, number> = {};

    data.forEach(item => {
      const penyakit = item.penyakit.trim();
      if (penyakit) {
        diseaseCount[penyakit] = (diseaseCount[penyakit] || 0) + 1;
      }
    });

    return Object.entries(diseaseCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  // Add this state to store the processed chart data
  const [diseaseChartData, setDiseaseChartData] = useState<{ name: string, count: number }[]>([]);

  // Update the chart data when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setDiseaseChartData(processDiseaseData(data));
    }
  }, [data]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        {/* Form Input */}
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Grafik Hasil Kepuasan Masyarakat'
            href='/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh>Penyakit</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.nama}</TableTd>
                  <TableTd>
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </TableTd>
                  <TableTd>{item.jenisKelamin}</TableTd>
                  <TableTd>{item.penyakit}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan/${item.id}`)}>
                      <IconDeviceImacCog size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Paper>
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage)} // ini penting!
            total={totalPages}
            mt="md"
            mb="md"
          />
        </Center>


        {/* Chart */}
        {!mounted && !chartData ? (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={3}>Grafik Hasil Kepuasan Masyarakat</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 420, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Grafik Hasil Kepuasan Masyarakat</Title>
              {mounted && diseaseChartData.length > 0 && (
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={diseaseChartData} >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={colors['blue-button']} name="Jumlah Kasus" />
                </BarChart>
              )}
            </Paper>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default GrafikHasilKepuasanMasyarakat;
