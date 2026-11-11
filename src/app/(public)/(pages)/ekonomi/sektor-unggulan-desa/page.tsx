'use client'
import colors from '@/con/colors';
import {
  Stack,
  Box,
  Text,
  Paper,
  Skeleton,
  Center,
  Title,
  Pagination
} from '@mantine/core';
import React, { useState } from 'react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';
import { useProxy } from 'valtio/utils';
import grafikSektorUnggulan from '@/app/admin/(dashboard)/_state/ekonomi/sektor-unggulan-desa';
import { useShallowEffect } from '@mantine/hooks';
import { formatSektorValue, resolveChartUnit } from '@/lib/sektor-unggulan';

function Page() {
  const state = useProxy(grafikSektorUnggulan)

  const {
    data,
    loading
  } = state.findMany

  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 3;

  useShallowEffect(() => {
    // Muat semua data tanpa batasan jumlah per halaman
    state.findMany.load() // Ambil banyak data sekaligus
  }, [])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  if (data.length === 0) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
          <Title order={1} c={colors['blue-button']} fw="bold">
            Sektor Unggulan Desa Darmasaba
          </Title>
          <Text c="dimmed" mt="md" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
            Data sektor unggulan belum tersedia
          </Text>
        </Box>
      </Stack>
    );
  }

  // Filter data untuk halaman saat ini
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const plottable = data.filter(item => item?.name && typeof item.value === 'number');
  const chartUnit = resolveChartUnit(plottable);

  const chartData = plottable.map((item) => ({
    id: item.id,
    sektor: item.name,
    [chartUnit]: item.value,
  }));

  const chartWidth = Math.max(600, chartData.length * 150);

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Title ta="center" order={1} c={colors['blue-button']} fw="bold">
          Sektor Unggulan Desa Darmasaba
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={{ base: 1.5, md: 1.6 }}
          mt="sm"
        >
          Desa Darmasaba dikenal sebagai desa dengan potensi unggulan di sektor pertanian dan peternakan
        </Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg" justify="center">
          {currentData.map((v, k) => {
            return (
              <Paper p="xl" key={`${startIndex + k}`}>
                <Title order={3} fw="bold">
                  {v.name}
                </Title>
                {formatSektorValue(v) && (
                  <Text fw={600} c={colors['blue-button']} fz={{ base: 'sm', md: 'md' }} mt={4}>
                    {formatSektorValue(v)}
                  </Text>
                )}
                <Text
                  ta="justify"
                  fz={{ base: 'sm', md: 'md' }}
                  lh={{ base: 1.5, md: 1.6 }}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                  dangerouslySetInnerHTML={{ __html: v.description || '' }}
                />
              </Paper>
            );
          })}

          {/* Pagination */}
          <Center mt="xl">
            <Pagination
              total={Math.ceil(data.length / itemsPerPage)}
              value={activePage}
              onChange={setActivePage}
              size="lg"
              radius="md"
            />
          </Center>

          <Box style={{ width: '100%', overflowX: 'auto' }}>
            <Paper p="xl">
              <Title order={3} fw="bold" pb="md">
                Statistik Sektor Unggulan Darmasaba
              </Title>
              <Box style={{ width: '100%', overflowX: 'auto', maxWidth: `${chartWidth}px` }}>
                <Center>
                  <BarChart
                    p={10}
                    h={300}
                    data={chartData}
                    dataKey="sektor"
                    series={[
                      { name: chartUnit, color: colors['blue-button'] },
                    ]}
                    tickLine="y"
                    tooltipAnimationDuration={200}
                    withTooltip
                    withXAxis
                    withYAxis
                    xAxisLabel="Sektor"
                    yAxisLabel={chartUnit}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '12px',
                    }}
                  />
                </Center>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;