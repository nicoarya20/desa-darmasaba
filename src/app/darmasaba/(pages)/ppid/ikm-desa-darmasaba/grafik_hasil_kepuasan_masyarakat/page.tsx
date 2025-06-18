/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikHasilKepuasanMasyarakat from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikHasilKepuasan';
import colors from '@/con/colors';
import { Box, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikHasilKepuasan() {
  const grafikHasilKepuasan = useProxy(grafikHasilKepuasanMasyarakat)
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    setMounted(true);
  }, [])

  useShallowEffect(() => {
    const fetchData = async () => {
      await grafikHasilKepuasan.findMany.load();
      if (grafikHasilKepuasan.findMany.data && grafikHasilKepuasan.findMany.data.length > 0) {
        setChartData(grafikHasilKepuasan.findMany.data);
      }
    };
    fetchData();
  }, []);

  if(!grafikHasilKepuasan.findMany.data) return <Stack>
    <Title pb={10} order={3}>Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik</Title>
    <Skeleton h={500} />
  </Stack>

  return (
    <Stack gap={"xl"}>
      <Text fw={"bold"} fz={{ base: 'h4', md: 'h3' }} ta={"center"}>
        Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik
      </Text>
      <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
      {mounted && chartData.length > 0 && (
        <BarChart width={isMobile ? 300 : isTablet ? 400 : 450} height={380} data={chartData} >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend style={{justifyContent: 'center'}} />
          <Bar dataKey="kepuasan" fill={colors['blue-button']} name="Kepuasan" />
        </BarChart>
      )}
      </Box>
    </Stack>
  );
}

export default GrafikHasilKepuasan;
