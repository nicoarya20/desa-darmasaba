'use client'
import jumlahPendudukMiskin from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-penduduk-miskin';
import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import { Box, Paper, Skeleton, Stack, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

function Page() {
  type JPMGrafik = {
    id: string;
    year: number;
    totalPoorPopulation: number;
  }
  const state = useProxy(jumlahPendudukMiskin)
  const [chartData, setChartData] = useState<JPMGrafik[]>([])

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  useEffect(() => {
    if (state.findMany.data) {
      setChartData(state.findMany.data.map((item) => ({
        id: item.id,
        year: Number(item.year),
        totalPoorPopulation: Number(item.totalPoorPopulation),
      })));
    }
  }, [state.findMany.data]);

  if (!state.findMany.data) {
    return (
      <Stack>
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
        <Title
          order={1}
          ta={"center"}
          c={colors["blue-button"]}
          fw={"bold"}
          lh={1.1}
        >
          Jumlah Penduduk Miskin
        </Title>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper p={'xl'}>
            <Title order={3} fw={'normal'} lh={1.1}>
              Jumlah Data Penduduk Miskin
            </Title>
            <Title order={2} fw={"bold"} lh={1.1}>
              {state.findMany.data?.reduce((sum, item) => sum + (Number(item.totalPoorPopulation) || 0), 0).toLocaleString()} Orang
            </Title>
          </Paper>
          <Paper p={'xl'}>
            <Title order={3} pb={10} fw={'bold'} lh={1.1}>
              Jumlah Penduduk Miskin Per Tahun
            </Title>
            <BarChart
              h={300}
              data={chartData}
              dataKey="year"
              series={[
                { name: 'totalPoorPopulation', color: 'blue.6', label: 'Jumlah Penduduk Miskin' },
              ]}
              xAxisLabel="Tahun"
              yAxisLabel="Jumlah Penduduk"
            />
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;