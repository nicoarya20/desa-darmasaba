'use client'
import programKemiskinanState from '@/app/admin/(dashboard)/_state/ekonomi/program-kemiskinan';
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
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
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const state = useProxy(programKemiskinanState)

  const statistikData = state.findMany.data
    .filter((item): item is ProgramKemiskinanData & { statistik: StatistikData } => {
      return !!item?.statistik && 
             item.statistik.tahun !== undefined && 
             item.statistik.jumlah !== undefined;
    })
    .map(item => ({
      tahun: Number(item.statistik.tahun) || 0,
      jumlah: Number(item.statistik.jumlah) || 0,
    }))
    .sort((a, b) => a.tahun - b.tahun)
    .filter(item => !isNaN(item.tahun) && !isNaN(item.jumlah));

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
    <Stack pos="relative" bg={colors.Bg} py={{ base: 'xl', md: 'xl' }} gap={'22'}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Grid align="center">
          <GridCol span={{ base: 12, md: 9 }}>
            <Title
              order={1}
              c={colors["blue-button"]}
              fw="bold"
              lh={{ base: 1.2, md: 1.2 }}
            >
              Program Kemiskinan
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari Program"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w="100%"
            />
          </GridCol>
        </Grid>
        <Text
          fz={{ base: 'sm', md: 'md' }}
          lh={{ base: 1.5, md: 1.6 }}
          c="black"
          ta="left"
          pt={{ base: 'sm', md: 20 }}
        >
          Berbagai program bantuan untuk mengurangi kemiskinan dan meningkatkan kesejahteraan masyarakat
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify="center">
          <SimpleGrid
            pb={{ base: 'md', md: 10 }}
            cols={{
              base: 1,
              md: 2
            }}
          >
            {state.findMany.data.map(v => {
              return (
                <Paper p={{ base: 'lg', md: 'xl' }} key={v.id}>
                  <Title
                    order={3}
                    fw="bold"
                    c={colors['blue-button']}
                    lh={{ base: 1.2, md: 1.2 }}
                  >
                    {v.nama}
                  </Title>
                  <Text
                    fz={{ base: 'sm', md: 'md' }}
                    lh={{ base: 1.5, md: 1.6 }}
                    c="black"
                    style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                    dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                  />
                </Paper>
              )
            })}
          </SimpleGrid>
          <Center my={{ base: 'md', md: 10 }}>
            <Pagination
              value={page}
              onChange={(newPage) => {
                load(newPage)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              total={totalPages}
              my="md"
            />
          </Center>
          <Paper p={{ base: 'lg', md: 'xl' }}>
            <Title
              order={3}
              fw="bold"
              c={colors['blue-button']}
              lh={{ base: 1.2, md: 1.2 }}
              mb="md"
            >
              Statistik Kemiskinan Masyarakat
            </Title>
            <Box style={{ width: '100%', height: 'auto' }}>
              {statistikData.length > 0 ? (
                <Box w="100%" style={{ overflowX: 'auto' }}>
                  <Center>
                    <RechartsLineChart 
                      width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 100 : 800)} 
                      height={400}
                      data={statistikData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="tahun" 
                        label={{ value: 'Tahun', position: 'insideBottomRight', offset: -5 }} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: 'Jumlah', angle: -90, position: 'insideLeft' }}
                        domain={[0, 'auto']}
                        tick={{ fontSize: 12 }}
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
                  <Text
                    fz={{ base: 'xs', md: 'sm' }}
                    c="dimmed"
                    lh={{ base: 1.4, md: 1.4 }}
                  >
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