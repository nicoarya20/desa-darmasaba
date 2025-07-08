'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import grafikSektorUnggulan from '../../_state/ekonomi/sektor-unggulan-desa';
import { useProxy } from 'valtio/utils';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';

function SektorUnggulanDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Sektor Unggulan Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSektorUnggulanDesa search={search} />
    </Box>
  );
}

function ListSektorUnggulanDesa({ search }: { search: string }) {
  const router = useRouter();
  const state = useProxy(grafikSektorUnggulan);
  const [chartData, setChartData] = useState<{id: string; name: string; description: string | null; value: number | null}[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  const filteredData = (state.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      (item.value?.toString() || '').toLowerCase().includes(keyword)
    );
  });

  useShallowEffect(() => {
    setMounted(true)
    state.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (state.findMany.data) {
      setChartData(state.findMany.data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        value: Number(item.value),
      })));
    }
  }, [state.findMany.data]);

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Sektor Unggulan Desa'
          href='/admin/ekonomi/sektor-unggulan-desa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Sektor Unggulan</TableTh>
              <TableTh>Deskripsi Sektor Unggulan</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>{item.description}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/sektor-unggulan-desa/${item.id}`)}>
                    <IconDeviceImac size={20} />
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
              <Title pb={10} order={3}>Grafik Hasil Kepuasan Masyarakat</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Grafik Sektor Unggulan Desa</Title>
              {mounted && chartData.length > 0 && (
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={chartData} >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={colors['blue-button']} name="Jumlah" />
                </BarChart>
              )}
            </Paper>
          </Box>
        )}
    </Box>
  );
}

export default SektorUnggulanDesa;
