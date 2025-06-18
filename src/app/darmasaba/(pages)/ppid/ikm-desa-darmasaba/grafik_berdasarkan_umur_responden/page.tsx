/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikBerdasarkanUmur from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanUmur';
import colors from '@/con/colors';
import { Box, Center, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikBerdasarakanUmur() {
    const stategrafikBerdasarkanUmur = useProxy(grafikBerdasarkanUmur)
    const [donutData, setDonutData] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
    }, []);
  
    const updateChartData = (data: any) => {
      if (data && data.length > 0) {
        const totalRemaja = data.reduce((acc: number, cur: any) => acc + Number(cur.remaja || 0), 0);
        const totalDewasa = data.reduce((acc: number, cur: any) => acc + Number(cur.dewasa || 0), 0);
        const totalOrangtua = data.reduce((acc: number, cur: any) => acc + Number(cur.orangtua || 0), 0);
        const totalLansia = data.reduce((acc: number, cur: any) => acc + Number(cur.lansia || 0), 0);
  
        setDonutData([
          { name: 'Remaja', value: totalRemaja, color: colors['blue-button'], key: 'remaja' },
          { name: 'Dewasa', value: totalDewasa, color: '#D32711FF', key: 'dewasa' },
          { name: 'Orangtua', value: totalOrangtua, color: '#B46B04FF', key: 'orangtua' },
          { name: 'Lansia', value: totalLansia, color: '#038617FF', key: 'lansia' }
        ]);
      }
    };
  
    useShallowEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = async () => {
      await stategrafikBerdasarkanUmur.findMany.load();
      if (stategrafikBerdasarkanUmur.findMany.data) {
        updateChartData(stategrafikBerdasarkanUmur.findMany.data);
      }
    }

    if(!stategrafikBerdasarkanUmur.findMany.data) return <Stack>
      <Title pb={10} order={3}>Grafik Berdasarkan Umur Responden</Title>
      <Skeleton h={500} />
    </Stack>
  return (
    <Stack>
    <Title pb={10} order={3}>Grafik Berdasarkan Umur Responden</Title>
    {mounted && donutData.length > 0 && (
      <Box style={{ width: '100%', height: 'auto', minHeight: 300 }}>
        <Center>
          <PieChart
            width={1000} height={530}
            data={donutData}
          >
            <Pie
              dataKey="value"
              nameKey="name"
              data={donutData}
              innerRadius={120}
              outerRadius={230}
              label={true}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </Center>
        <Flex gap={"md"} align={"center"}>
          <Box bg={colors['blue-button']} w={20} h={20} />
          <Text>17 - 25 tahun: {donutData.find((entry) => entry.name === 'remaja')?.value}</Text>
        </Flex>
        <Flex gap={"md"} align={"center"}>
          <Box bg={'#D32711FF'} w={20} h={20} />
          <Text>26 - 45 tahun: {donutData.find((entry) => entry.name === 'dewasa')?.value}</Text>
        </Flex>
        <Flex gap={"md"} align={"center"}>
          <Box bg={'#B46B04FF'} w={20} h={20} />
          <Text>46 - 60 tahun: {donutData.find((entry) => entry.name === 'orangtua')?.value}</Text>
        </Flex>
        <Flex gap={"md"} align={"center"}>
          <Box bg={'#038617FF'} w={20} h={20} />
          <Text>di atas 60 tahun: {donutData.find((entry) => entry.name === 'lansia')?.value}</Text>
        </Flex>
      </Box>
    )}
  </Stack>
  );
}

export default GrafikBerdasarakanUmur;
