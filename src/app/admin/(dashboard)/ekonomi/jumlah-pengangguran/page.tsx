'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

import { BarChart } from '@mantine/charts';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import jumlahPengangguranState from '../../_state/ekonomi/jumlah-pengangguran';

function DetailDataPengangguran() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <Stack gap={"xs"}>
      <HeaderSearch
        title='Detail Data Pengangguran'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
        <ListDetailDataPengangguran search={search} />
      </Stack>
    </Box>
  );
}

function ListDetailDataPengangguran({search}: {search: string}) {

  type DetailDataPengangguran = {
    id: string;
    month: string;
    year: number;
    educatedUnemployment: number;
    uneducatedUnemployment: number;
    percentageChange: number;
    totalUnemployment: number;
  }
  const [chartData, setChartData] = useState<DetailDataPengangguran[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran)
  const router = useRouter();

  useShallowEffect(() => {
    setMounted(true)
    stateDetail.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (stateDetail.findMany.data) {
      setChartData(stateDetail.findMany.data.map((item) => ({
        id: item.id,
        month: item.month,
        year: item.year && typeof item.year === 'object' && 'getFullYear' in item.year ? (item.year as Date).getFullYear() : Number(item.year),
        educatedUnemployment: Number(item.educatedUnemployment),
        uneducatedUnemployment: Number(item.uneducatedUnemployment),
        percentageChange: Number(item.percentageChange),
        totalUnemployment: Number(item.totalUnemployment),
      })));
    }
  }, [stateDetail.findMany.data]);

  const filteredData = (stateDetail.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.month.toLowerCase().includes(keyword) ||
      item.year.toString().toLowerCase().includes(keyword)
    );
  });

  if (!stateDetail.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Box>
      <Stack gap={"md"}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulList
            title='List Detail Data Pengangguran'
            href='/admin/ekonomi/jumlah-pengangguran/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Bulan</TableTh>
                <TableTh>Terdidik</TableTh>
                <TableTh>Tidak Terdidik</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.month}</TableTd>
                  <TableTd>{item.educatedUnemployment}</TableTd>
                  <TableTd>{item.uneducatedUnemployment}</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/${item.id}`)}>
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
              <Title pb={10} order={3}>Data Pengangguran Terdidik dan Tidak Terdidik</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 550, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Data Pengangguran Terdidik dan Tidak Terdidik</Title>
              {mounted && chartData.length > 0 && (
                <Box w={{ base: '100%', md: '70%' }}>
                  <BarChart
                    h={450}
                    data={chartData}
                    dataKey="month"
                    series={[
                      { name: 'educatedUnemployment', color: 'red.6', label: 'Terdidik' },
                      { name: 'uneducatedUnemployment', color: 'orange.6', label: 'Tidak Terdidik' },
                    ]}
                  />
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default DetailDataPengangguran;
