'use client'
import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';
import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import { Box, ColorSwatch, Flex, Group, Paper, SimpleGrid, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSchool, IconSchoolOff, IconUserOff } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

type DataPengangguran = {
  id: string;
  bulan: string;
  berpendidikan: number;
  takberpendidikan: number;
}

function Page() {
  const [chartData, setChartData] = useState<DataPengangguran[]>([])
  const [mounted, setMounted] = useState(false)
  const [yearlyData, setYearlyData] = useState<{
    total: number;
    educated: number;
    uneducated: number;
    year: number;
  } | null>(null);
  const state = useProxy(jumlahPengangguranState.jumlahPengangguran)
  const currentYear = new Date().getFullYear();

  useShallowEffect(() => {
    setMounted(true)
    state.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (state.findMany.data) {
      setChartData(state.findMany.data.map((item) => ({
        id: item.id,
        bulan: item.month,
        berpendidikan: Number(item.educatedUnemployment),
        takberpendidikan: Number(item.uneducatedUnemployment),
      })));

      const currentYearData = state.findMany.data.filter(item => item.year === currentYear);
      if (currentYearData.length > 0) {
        const yearlyTotal = {
          total: 0,
          educated: 0,
          uneducated: 0,
          year: currentYear
        };

        currentYearData.forEach(item => {
          yearlyTotal.total += Number(item.totalUnemployment) || 0;
          yearlyTotal.educated += Number(item.educatedUnemployment) || 0;
          yearlyTotal.uneducated += Number(item.uneducatedUnemployment) || 0;
        });

        setYearlyData(yearlyTotal);
      } else {
        setYearlyData(null);
      }
    }
  }, [state.findMany.data, currentYear]);

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Title
          order={1}
          ta={"center"}
          c={colors["blue-button"]}
          fw={"bold"}
          lh={1.2}
        >
          Jumlah Pengangguran
        </Title>
        <Group py={20} align='center' justify='space-between'>
          <Title order={2} fw={"bold"} lh={1.2}>
            DATA PENGANGGURAN DESA
          </Title>
        </Group>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid cols={1} pb={20}>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* Total Unemployment Card */}
              <Paper px={25} py={'lg'} bg={colors['white-1']} shadow="md">
                <Flex direction="column" gap="md">
                  <IconUserOff size={35} color={colors['blue-button']} />
                  <Title order={3} fw={600} lh={1.2}>
                    Total Pengangguran
                  </Title>
                  <Text fz={{ base: 'lg', md: 'xl' }} fw={700} c={colors['blue-button']} lh={1.2}>
                    {yearlyData?.total.toLocaleString() || 0} Orang
                  </Text>
                  <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed" lh={1.4}>
                    Total data tahun {currentYear}
                  </Text>
                </Flex>
              </Paper>

              {/* Educated Unemployment Card */}
              <Paper px={25} py={'lg'} bg={colors['white-1']} shadow="md">
                <Flex direction="column" gap="md">
                  <IconSchool size={35} color="#5082EE" />
                  <Title order={3} fw={600} lh={1.2}>
                    Pengangguran Terdidik
                  </Title>
                  <Text fz={{ base: 'lg', md: 'xl' }} fw={700} c="#5082EE" lh={1.2}>
                    {yearlyData?.educated.toLocaleString() || 0} Orang
                  </Text>
                  <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed" lh={1.4}>
                    {yearlyData ?
                      <>
                        {((yearlyData.educated / yearlyData.total) * 100).toFixed(1)}%
                        dari total pengangguran
                      </> : 'Tidak ada data'}
                  </Text>
                </Flex>
              </Paper>

              {/* Uneducated Unemployment Card */}
              <Paper px={25} py={'lg'} bg={colors['white-1']} shadow="md">
                <Flex direction="column" gap="md">
                  <IconSchoolOff size={35} color="#DA524C" />
                  <Title order={3} fw={600} lh={1.2}>
                    Pengangguran Tidak Terdidik
                  </Title>
                  <Text fz={{ base: 'lg', md: 'xl' }} fw={700} c="#DA524C" lh={1.2}>
                    {yearlyData?.uneducated.toLocaleString() || 0} Orang
                  </Text>
                  <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed" lh={1.4}>
                    {yearlyData ?
                      <>
                        {((yearlyData.uneducated / yearlyData.total) * 100).toFixed(1)}%
                        dari total pengangguran
                      </> : 'Tidak ada data'}
                  </Text>
                </Flex>
              </Paper>
            </SimpleGrid>
          </SimpleGrid>
          <Paper p={'lg'}>
            <Flex pb={30} justify={'flex-end'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                    Pengangguran Berpendidikan
                  </Text>
                  <ColorSwatch color="#5082EE" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                    Pengangguran Tak Berpendidikan
                  </Text>
                  <ColorSwatch color="#DA524C" size={30} />
                </Flex>
              </Box>
            </Flex>
            {!mounted || chartData.length === 0 ? (
              <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
                <Paper bg={colors['white-1']} p={'md'}>
                  <Title order={3} pb={10} lh={1.2}>
                    Data Pengangguran Terdidik dan Tidak Terdidik
                  </Title>
                  <Text c='dimmed' fz={{ base: 'xs', md: 'sm' }} lh={1.4}>
                    Belum ada data untuk ditampilkan dalam grafik
                  </Text>
                </Paper>
              </Box>
            ) : (
              <Box style={{ width: '100%', minWidth: 300, height: 550, minHeight: 300 }}>
                <Paper bg={colors['white-1']} p={'md'}>
                  <Title order={3} pb={10} lh={1.2}>
                    Data Pengangguran Terdidik dan Tidak Terdidik
                  </Title>
                  <Box 
                  w={{ base: '100%', md: '70%' }} 
                  style={{ overflowX: "auto" }}
                  >
                    <BarChart
                      h={450}
                      data={chartData}
                      dataKey="bulan"
                      series={[
                        { name: 'berpendidikan', color: '#5082EE', label: 'Terdidik' },
                        { name: 'takberpendidikan', color: '#DA524C', label: 'Tidak Terdidik' },
                      ]}
                    />
                  </Box>
                </Paper>
              </Box>
            )}
          </Paper>
          <Paper p={'lg'}>
            <Title order={2} fw={'bold'} fz={{ base: 'md', md: 'lg' }} lh={1.2}>
              Detail Data Pengangguran
            </Title>
            <Box style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <TableThead>
                  <TableTr>
                    <TableTh ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                      Bulan
                    </TableTh>
                    <TableTh ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                      Total
                    </TableTh>
                    <TableTh ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                      Terdidik
                    </TableTh>
                    <TableTh ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                      Tidak Terdidik
                    </TableTh>
                    <TableTh ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                      Perubahan
                    </TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {state.findMany.data?.map((item, index) => (
                    <TableTr key={item?.id ? String(item.id) : `row-${index}`}>
                      <TableTd ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                        {item.month}
                      </TableTd>
                      <TableTd ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                        {item.totalUnemployment}
                      </TableTd>
                      <TableTd ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                        {item.educatedUnemployment}
                      </TableTd>
                      <TableTd ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                        {item.uneducatedUnemployment}
                      </TableTd>
                      <TableTd ta={'center'} fz={{ base: 'sm', md: 'md' }} lh={1.45}>
                        {item.percentageChange}%
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;