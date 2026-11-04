'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import programKemiskinanState from '../../_state/ekonomi/program-kemiskinan';

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit (Safari/iOS),
 * clamp gagal kalau isinya mengandung tag blok (<p>, <div>, <ul>, <h1-6>)
 * -- teks tampil penuh dan overlap dengan elemen di bawahnya, tapi hanya
 * di Safari (mis. iPhone X). Deskripsi rich-text sering berisi tag blok,
 * jadi harus diratakan jadi plain text dulu sebelum di-clamp.
 *
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR. Pola sama
 * dengan fix di src/app/admin/(dashboard)/landing-page/profil/program-inovasi/page.tsx
 */
function toPlainText(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function ProgramKemiskinan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Program Kemiskinan'
        placeholder='Cari judul program atau deskripsi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKemiskinan search={search} />
    </Box>
  );
}

function ListProgramKemiskinan({ search }: { search: string }) {
  const programState = useProxy(programKemiskinanState);
  const router = useRouter();
  const [lineChart, setLineChart] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const { data, page, totalPages, loading, load } = programState.findMany;

  useShallowEffect(() => {
    setMounted(true);
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (data) {
      const chartData = data
        .filter((item) => item.statistik)
        .map((item) => ({
          tahun: item.statistik?.tahun,
          jumlah: Number(item.statistik?.jumlah),
        }))
        .sort((a, b) => (a.tahun || 0) - (b.tahun || 0));

      setLineChart(chartData);
    }
  }, [data]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      {/* Daftar Program Kemiskinan */}
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Program Kemiskinan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/ekonomi/program-kemiskinan/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Judul Program
                  </Text>
                </TableTh>
                <TableTh style={{ width: '40%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Deskripsi Singkat
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Jumlah Masyarakat Miskin
                  </Text>
                </TableTh>
                <TableTh style={{ width: '10%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Aksi
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} fz="md" lh={1.45} truncate lineClamp={1}>
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" lh={1.45} truncate lineClamp={2} c="dark.9">{toPlainText(item.deskripsi) || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" lh={1.45} fw={500}>
                        {item.statistik?.jumlah || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/ekonomi/program-kemiskinan/${item.id}`)}
                        fz="sm"
                        lh={1.4}
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data program kemiskinan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Judul Program
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Deskripsi Singkat
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4} c="dark.9" lineClamp={2}>{toPlainText(item.deskripsi) || '-'}</Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Jumlah Masyarakat Miskin
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.statistik?.jumlah || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Button
                        fullWidth
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/ekonomi/program-kemiskinan/${item.id}`)}
                        fz="sm"
                        lh={1.4}
                      >
                        <IconDeviceImac size={18} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data program kemiskinan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
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
      <Box pt={{ base: 'md', md: 'lg' }}>
        <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
          <Title order={4} lh={1.2} pb={{ base: 'sm', md: 'md' }}>
            Grafik Berdasarkan Responden
          </Title>
          {mounted && lineChart.length > 0 ? (
            <Box>
              <Box
                component="div"
                miw={{ base: 320, md: 820 }}
                mx="auto"
                style={{ overflowX: 'auto' }}
              >
                <LineChart
                  width={Math.max(320, lineChart.length * 60)}
                  height={300}
                  data={lineChart}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tahun" />
                  <YAxis />
                  <RechartTooltip
                    formatter={(value: any) => [`${value} orang`, 'Jumlah']}
                    labelFormatter={(label: any) => `Tahun: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="jumlah"
                    name="Jumlah per Tahun"
                    stroke={colors['blue-button']}
                  />
                </LineChart>
              </Box>
            </Box>
          ) : (
            <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
              Belum ada data untuk ditampilkan dalam grafik
            </Text>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default ProgramKemiskinan;