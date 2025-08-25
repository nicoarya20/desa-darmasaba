'use client'
import colors from '@/con/colors';
import { Stack, Box, Text, SimpleGrid, Paper, Skeleton, Center, Pagination, Grid, GridCol, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { CartesianGrid, Legend, Line, LineChart as RechartsLineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import programKemiskinanState from '@/app/admin/(dashboard)/_state/ekonomi/program-kemiskinan';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';

interface StatistikData {
  id: string;
  tahun: number;
  jumlah: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProgramKemiskinanData {
  id: string;
  nama: string;
  deskripsi: string;
  ikonUrl: string | null;
  statistik: StatistikData | null;
  isActive: boolean;
  statistikId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function Page() {
  const [search, setSearch] = useState('')
  const state = useProxy(programKemiskinanState)

  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = state.findMany

  useShallowEffect(() => {
    load(page, 2, search)
  }, [page, search])

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
            {state.findMany.data.map((v, k) => {
              return (
                <Paper p={'xl'} key={k}>
                  <Text fz={'h3'} fw={'bold'} c={colors['blue-button']}>{v.nama}</Text>
                  <Text fz={'lg'} c={'black'} dangerouslySetInnerHTML={{ __html: v.deskripsi }}></Text>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Center my={10}>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              my={"md"}
            />
          </Center>
          <Paper p={'xl'}>
            <Text fz={'h3'} fw={'bold'} c={colors['blue-button']} mb="md">Statistik Kemiskinan Masyarakat</Text>
            <Box style={{ width: '100%', height: 'auto' }}>
              {data.length > 0 && data[0]?.statistik ? (
                <Box w="100%" style={{ overflowX: 'auto' }}>
                  <Center>
                    <RechartsLineChart
                      width={800}
                      height={300}
                      data={state.findMany.data
                        .filter((item): item is ProgramKemiskinanData & { statistik: StatistikData } =>
                          item.statistik !== null
                        )
                        .map(item => ({
                          tahun: item.statistik.tahun,
                          jumlah: item.statistik.jumlah
                        }))
                        .sort((a, b) => a.tahun - b.tahun)
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tahun" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} orang`, name]}
                        labelFormatter={(label: number) => `Tahun: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="jumlah"
                        name="Jumlah Masyarakat Miskin"
                        stroke={colors['blue-button']}
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </Center>
                </Box>
              ) : (
                <Text c="dimmed">Belum ada data statistik yang tersedia</Text>
              )}
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
