'use client'
import programKemiskinanState from '@/app/admin/(dashboard)/_state/ekonomi/program-kemiskinan';
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { CartesianGrid, Line, LineChart as RechartsLineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

interface StatistikData {
  id: string;
  tahun: number;
  jumlah: number;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProgramKemiskinanData {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string;
  statistik: StatistikData | null;
  isActive: boolean;
  statistikId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function Page() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const state = useProxy(programKemiskinanState)

  // 🔧 Get valid statistics data with proper type checking
  const statistikData = state.findMany.data
    .filter((item): item is ProgramKemiskinanData & { statistik: StatistikData } => {
      return !!item?.statistik && 
             item.statistik.tahun !== undefined && 
             item.statistik.jumlah !== undefined;
    })
    .map(item => ({
      tahun: Number(item.statistik.tahun) || 0, // Ensure tahun is a number
      jumlah: Number(item.statistik.jumlah) || 0, // Ensure jumlah is a number
    }))
    .sort((a, b) => a.tahun - b.tahun)
    .filter(item => !isNaN(item.tahun) && !isNaN(item.jumlah)); // Remove any invalid entries

  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = state.findMany

  useShallowEffect(() => {
    load(page, 2, debouncedSearch)
  }, [page, debouncedSearch])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Grid align='center'>
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Program Kemiskinan
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Program'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "50%", md: "100%" }}
            />
          </GridCol>
        </Grid>
        <Text fz={'h4'}>Berbagai program bantuan untuk mengurangi kemiskinan dan meningkatkan kesejahteraan masyarakat</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <SimpleGrid
            pb={10}
            cols={{
              base: 1,
              md: 2
            }}
          >
            {state.findMany.data.map(v => {
              return (
                <Paper p={'xl'} key={v.id}>
                  <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.nama}</Text>
                  <Text fz={'lg'} c={'black'} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: v.deskripsi }}></Text>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Center my={10}>
            <Pagination
              value={page}
              onChange={(newPage) => {
                load(newPage)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              total={totalPages}
              my={"md"}
            />
          </Center>
          <Paper p={'xl'}>
            <Text fz={'h3'} fw={'bold'} c={colors['blue-button']} mb="md">Statistik Kemiskinan Masyarakat</Text>
            <Box style={{ width: '100%', height: 'auto' }}>
              {statistikData.length > 0 ? (
                <Box w="100%" style={{ overflowX: 'auto' }}>
                  <Center>
                    <RechartsLineChart 
                      width={Math.min(800, window.innerWidth - 100)} 
                      height={400}
                      data={statistikData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="tahun" 
                        label={{ value: 'Tahun', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Jumlah', angle: -90, position: 'insideLeft' }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} orang`, 'Jumlah']}
                        labelFormatter={(label) => `Tahun ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="jumlah" 
                        name="Jumlah"
                        stroke="#228be6" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </Center>
                </Box>
              ) : (
                <Box p="md" ta="center" bg="gray.0" style={{ borderRadius: '8px' }}>
                  <Text c="dimmed">
                    {state.findMany.loading 
                      ? 'Memuat data statistik...' 
                      : 'Belum ada data statistik yang tersedia atau data tidak valid'}
                  </Text>
                </Box>
              )}
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
