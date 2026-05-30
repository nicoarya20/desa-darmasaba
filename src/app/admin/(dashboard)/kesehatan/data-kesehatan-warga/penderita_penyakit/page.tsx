/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Select,
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
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Tooltip as ChartTooltip,
  Legend,
  XAxis,
  YAxis,
} from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import grafikkepuasan from '../../../_state/kesehatan/data_kesehatan_warga/grafikKepuasan';

function GrafikHasilKepuasanMasyarakat() {
  const [search, setSearch] = useState('');

  return (
    <Box>
      <HeaderSearch
        title="Penderita Penyakit"
        placeholder="Cari nama atau alamat..."
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
    banjar?: { id: string; name: string } | null;
  };

  const stateGrafikKepuasan = useProxy(grafikkepuasan);
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [chartData, setChartData] = useState<PDKMGrafik[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedBanjar, setSelectedBanjar] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  const { data, page, totalPages, loading, load } = stateGrafikKepuasan.findMany;
  const { data: banjarList } = stateGrafikKepuasan.banjarList;

  useShallowEffect(() => {
    stateGrafikKepuasan.banjarList.load();
  }, []);

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, debouncedSearch, selectedBanjar ?? '');
  }, [page, debouncedSearch, selectedBanjar]);

  useEffect(() => {
    if (data) {
      setChartData(
        data.map((item) => ({
          ...item,
          tanggal:
            item.tanggal instanceof Date
              ? item.tanggal.toISOString()
              : item.tanggal,
        }))
      );
    }
  }, [data]);

  const processDiseaseData = (data: PDKMGrafik[]) => {
    const diseaseCount: Record<string, number> = {};
    data.forEach((item) => {
      const penyakit = item.penyakit.trim();
      if (penyakit) {
        diseaseCount[penyakit] = (diseaseCount[penyakit] || 0) + 1;
      }
    });
    return Object.entries(diseaseCount).map(([name, count]) => ({ name, count }));
  };

  const [diseaseChartData, setDiseaseChartData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setDiseaseChartData(processDiseaseData(data));
    }
  }, [data]);

  const filteredData = data || [];

  const banjarOptions = [
    { value: '', label: 'Semua Banjar' },
    ...banjarList.map((b) => ({ value: b.id, label: b.name })),
  ];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap='lg' py={{ base: 'md', md: 'lg' }}>
      {/* Daftar Penderita Penyakit */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.15 }}
          >
            Daftar Penderita Penyakit
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/penderita_penyakit/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Filter Banjar */}
        <Box mb="sm" maw={280}>
          <Select
            placeholder="Filter berdasarkan banjar"
            data={banjarOptions}
            value={selectedBanjar ?? ''}
            onChange={(val) => {
              setSelectedBanjar(val || null);
              load(1, 10, debouncedSearch, val ?? '');
            }}
            clearable
            searchable
          />
        </Box>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed"
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh>Banjar</TableTh>
                <TableTh>Penyakit</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd fz="md" fw={500} lh={1.5}>
                      {item.nama}
                    </TableTd>
                    <TableTd fz="md" fw={500} lh={1.5}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableTd>
                    <TableTd fz="md" fw={500} lh={1.5}>
                      {item.jenisKelamin}
                    </TableTd>
                    <TableTd fz="md" fw={500} lh={1.5}>
                      {item.banjar?.name ?? '-'}
                    </TableTd>
                    <TableTd fz="md" fw={500} lh={1.5}>
                      {item.penyakit}
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/penderita_penyakit/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5} fz="sm" fw={500}>
                          Detail
                        </Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kepuasan masyarakat yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack gap="xs" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="sm">
                <Stack gap={4}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.nama}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4}>
                    Tanggal
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4}>
                    Jenis Kelamin
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.jenisKelamin}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4}>
                    Banjar
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.banjar?.name ?? '-'}
                  </Text>

                  <Text fz="sm" fw={600} lh={1.4}>
                    Penyakit
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.penyakit}
                  </Text>

                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="xs"
                    onClick={() =>
                      router.push(
                        `/admin/kesehatan/data-kesehatan-warga/penderita_penyakit/${item.id}`
                      )
                    }
                  >
                    <IconDeviceImacCog size={20} />
                    <Text ml={5} fz="sm" fw={500}>
                      Detail
                    </Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data kepuasan masyarakat yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, debouncedSearch, selectedBanjar ?? '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>

      {/* Chart Section */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Title
          order={2}
          lh={{ base: 1.2, md: 1.15 }}
          mb={{ base: 'sm', md: 'md' }}
        >
          Penderita Penyakit
        </Title>

        {mounted && diseaseChartData.length > 0 ? (
          <Center>
            <BarChart
              width={isMobile ? 320 : 800}
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
          <Center py={20}>
            <Text c="dimmed" fz="sm" lh={1.4}>
              Belum ada data untuk ditampilkan dalam grafik
            </Text>
          </Center>
        )}
      </Paper>
    </Stack>
  );
}

export default GrafikHasilKepuasanMasyarakat;
