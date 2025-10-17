'use client'
import colors from '@/con/colors';
import { Stack, Box, Text, Paper, Skeleton } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';
import { useProxy } from 'valtio/utils';
import grafikSektorUnggulan from '@/app/admin/(dashboard)/_state/ekonomi/sektor-unggulan-desa';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const state = useProxy(grafikSektorUnggulan)

  const {
    data,
    loading,
  } = state.findMany

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  // Add this check before the return statement
  if (data.length === 0) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
          <Text fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
            Sektor Unggulan Desa Darmasaba
          </Text>
          <Text c="dimmed" mt="md">
            Data sektor unggulan belum tersedia
          </Text>
        </Box>
      </Stack>
    );
  }

  const chartData = data
    .filter(item => item?.name && typeof item.value === 'number')
    .map((item) => ({
      id: item.id,
      sektor: item.name,
      Ton: item.value,
    }));


  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Sektor Unggulan Desa Darmasaba
        </Text>
        <Text ta={'center'} fz={'h4'}> Desa Darmasaba dikenal sebagai desa dengan potensi unggulan di sektor pertanian dan peternakan</Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          {data.map((v, k) => {
            return (
              <Paper p={'xl'} key={k}>
                <Text fw={'bold'} fz={'h4'}>{v.name}</Text>
                <Text fz={'h4'} ta={'justify'} style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: v.description || '' }} />
              </Paper>
            )
          })}
          <Box style={{ width: '100%', overflowX: 'auto' }}>
            <Paper p="xl">
              <Text pb={10} fw="bold" fz="h4">Statistik Sektor Unggulan Darmasaba</Text>
              <Box style={{ width: '100%', minWidth: '600px' }}>
                <BarChart
                  p={10}
                  h={300}
                  data={chartData}
                  dataKey="sektor"
                  series={[
                    { name: 'Ton', color: colors['blue-button'] },
                  ]}
                  tickLine="y"
                  tooltipAnimationDuration={200}
                  withTooltip
                  style={{
                    fontFamily: 'inherit',
                  }}
                  xAxisLabel="Sektor"
                  yAxisLabel="Ton"
                />
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
