/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
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
  Title,
  Tooltip
} from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Tooltip as ChartTooltip, Legend, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import grafikkepuasan from '../../../_state/kesehatan/data_kesehatan_warga/grafikKepuasan';

function GrafikHasilKepuasanMasyarakat() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      {/* Header Search */}
      <HeaderSearch
        title='Grafik Hasil Kepuasan Masyarakat'
        placeholder='Cari nama atau alamat...'
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
    tanggal: string | Date;
    jenisKelamin: string;
    alamat: string;
    penyakit: string;
  };

  const stateGrafikKepuasan = useProxy(grafikkepuasan);
  const [chartData, setChartData] = useState<PDKMGrafik[]>([]);
  const [mounted, setMounted] = useState(false);
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateGrafikKepuasan.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, search);
  }, [page, search]);

  useEffect(() => {
    if (data) {
      setChartData(data.map((item) => ({
        ...item,
        tanggal: item.tanggal instanceof Date ? item.tanggal.toISOString() : item.tanggal
      })));
    }
  }, [data]);

  const processDiseaseData = (data: PDKMGrafik[]) => {
    const diseaseCount: Record<string, number> = {};
    data.forEach(item => {
      const penyakit = item.penyakit.trim();
      if (penyakit) {
        diseaseCount[penyakit] = (diseaseCount[penyakit] || 0) + 1;
      }
    });
    return Object.entries(diseaseCount).map(([name, count]) => ({ name, count }));
  };

  const [diseaseChartData, setDiseaseChartData] = useState<{ name: string, count: number }[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setDiseaseChartData(processDiseaseData(data));
    }
  }, [data]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Grafik Hasil Kepuasan Masyarakat</Title>
          <Tooltip label="Tambah Data" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push(
                  '/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan/create'
                )
              }
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>

        {/* Tabel */}
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh>Penyakit</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={150}>
                        {item.nama}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {item.jenisKelamin}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Box w={150}>
                        {item.penyakit}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data kepuasan masyarakat yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
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

      {/* Chart */}
      <Box mt="lg" style={{ width: '100%', minWidth: 300, height: 420, minHeight: 300 }}>
        <Paper bg={colors['white-1']} p={'md'}>
          <Title pb={10} order={4}>Grafik Hasil Kepuasan Masyarakat</Title>
          {mounted && diseaseChartData.length > 0 ? (
            <Center>
              <BarChart
                width={isMobile ? 320 : isTablet ? 600 : 800} // kecilin biar muat
                height={350}
                data={diseaseChartData}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="count" fill={colors['blue-button']} name="Jumlah Kasus" />
              </BarChart>
            </Center>
          ) : (
            <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default GrafikHasilKepuasanMasyarakat;
