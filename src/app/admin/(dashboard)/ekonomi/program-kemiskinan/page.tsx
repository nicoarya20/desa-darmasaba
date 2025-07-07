/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import programKemiskinanState from '../../_state/ekonomi/program-kemiskinan';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

function ProgramKemiskinan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Program Kemiskinan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKemiskinan search={search}/>
    </Box>
  );
}

function ListProgramKemiskinan({ search }: { search: string }) {
  const programState = useProxy(programKemiskinanState)
  const router = useRouter();
  const [lineChart, setLineChart] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useShallowEffect(() => {
    setMounted(true)
    programState.findMany.load()
  }, [])

  useEffect(() => {
    if (programState.findMany.data) {
      const chartData = programState.findMany.data
        .filter(item => item.statistik)
        .map(item => ({
          tahun: item.statistik?.tahun,
          jumlah: Number(item.statistik?.jumlah)
        }))
        .sort((a, b) => (a.tahun || 0) - (b.tahun || 0)); // opsional, urutkan tahun

      setLineChart(chartData);

    }
  }, [programState.findMany.data])

  const filteredData = (programState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword) ||
      item.statistik?.tahun.toString().includes(keyword)
    );
  });

  if (!programState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Program Kemiskinan'
          href='/admin/ekonomi/program-kemiskinan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Judul Program</TableTh>
              <TableTh>Deskripsi Singkat</TableTh>
              <TableTh>Jumlah Masyarakat Miskin</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>
                  <Text fz={'sm'} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>{item.statistik?.jumlah}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/program-kemiskinan/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>

      {/* Chart */}
      <Box>
        <Paper bg={colors['white-1']} p={'md'} >
          <Stack>
            <Box >
              <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
              {mounted && lineChart.length > 0 ? (<Box style={{ width: '100%', height: 'auto', }}>
                <Box w={"100%"} style={{overflowX: 'auto'}}>
                  <LineChart
                    width={820}
                    height={300}
                    data={lineChart}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [`${value} orang`, name]}
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
                <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default ProgramKemiskinan;
