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
  const state = useProxy(jumlahPengangguranState.jumlahPengangguran)
  // const [selectedYear, setSelectedYear] = useState<string | null>(null);

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
    }
  }, [state.findMany.data]);

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Jumlah Pengangguran
        </Text>
        <Group py={20} align='center' justify='space-between'>
          <Text fz={'h4'} fw={"bold"}>DATA PENGANGGURAN DESA</Text>
        </Group>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            cols={1}
            pb={20}
          >
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* Total Unemployment Card */}
              <Paper px={25} py={'lg'} bg={colors['white-1']} shadow="md">
                <Flex direction="column" gap="md">
                  <IconUserOff size={35} color={colors['blue-button']} />
                  <Text fz="h4" fw={600}>Total Pengangguran</Text>
                  <Text fz="h2" fw={700} c={colors['blue-button']}>
                    {state.findMany.data?.[0]?.totalUnemployment || 0} Orang
                  </Text>
                  <Text fz="sm" c="dimmed">
                    Data tahun {state.findMany.data?.[0]?.year || ''}
                  </Text>
                </Flex>
              </Paper>

              {/* Educated Unemployment Card */}
              <Paper px={25} py={'lg'} bg={colors['white-1']} shadow="md">
                <Flex direction="column" gap="md">
                  <IconSchool size={35} color="#5082EE" />
                  <Text fz="h4" fw={600}>Pengangguran Terdidik</Text>
                  <Text fz="h2" fw={700} c="#5082EE">
                    {state.findMany.data?.[0]?.educatedUnemployment || 0} Orang
                  </Text>
                  <Text fz="sm" c="dimmed">
                    {state.findMany.data?.[0]?.totalUnemployment ?
                      `${Math.round((state.findMany.data[0].educatedUnemployment / state.findMany.data[0].totalUnemployment) * 100)}% dari total` :
                      '0% dari total'}
                  </Text>
                </Flex>
              </Paper>

              {/* Uneducated Unemployment Card */}
              <Paper px={25} py={'lg'} bg={colors['white-1']} shadow="md">
                <Flex direction="column" gap="md">
                  <IconSchoolOff size={35} color="#DA524C" />
                  <Text fz="h4" fw={600}>Pengangguran Tidak Terdidik</Text>
                  <Text fz="h2" fw={700} c="#DA524C">
                    {state.findMany.data?.[0]?.uneducatedUnemployment || 0} Orang
                  </Text>
                  <Text fz="sm" c="dimmed">
                    {state.findMany.data?.[0]?.totalUnemployment ?
                      `${Math.round((state.findMany.data[0].uneducatedUnemployment / state.findMany.data[0].totalUnemployment) * 100)}% dari total` :
                      '0% dari total'}
                  </Text>
                </Flex>
              </Paper>
            </SimpleGrid>
          </SimpleGrid>
          <Paper p={'lg'}>
            <Flex pb={30} justify={'flex-end'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Pengangguran Berpendidikan</Text>
                  <ColorSwatch color="#5082EE" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 0, md: 5 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>Pengangguran Tak Berpendidikan</Text>
                  <ColorSwatch color="#DA524C" size={30} />
                </Flex>
              </Box>
            </Flex>
            {!mounted || chartData.length === 0 ? (
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
                  <Box w={{ base: '100%', md: '70%' }}>
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
            <Text fw={'bold'} fz={'h4'}>Detail Data Pengangguran</Text>
            <Table striped highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh ta={'center'}>Bulan</TableTh>
                  <TableTh ta={'center'}>Total</TableTh>
                  <TableTh ta={'center'}>Terdidik</TableTh>
                  <TableTh ta={'center'}>Tidak Terdidik</TableTh>
                  <TableTh ta={'center'}>Perubahan</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {state.findMany.data?.map((item, index) => (
                  <TableTr key={item?.id ? String(item.id) : `row-${index}`}>
                    <TableTd ta={'center'}>{item.month}</TableTd>
                    <TableTd ta={'center'}>{item.totalUnemployment}</TableTd>
                    <TableTd ta={'center'}>{item.educatedUnemployment}</TableTd>
                    <TableTd ta={'center'}>{item.uneducatedUnemployment}</TableTd>
                    <TableTd ta={'center'}>{item.percentageChange}</TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
