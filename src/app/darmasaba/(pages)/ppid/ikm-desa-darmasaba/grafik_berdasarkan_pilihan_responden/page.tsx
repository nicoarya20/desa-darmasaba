/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikBerdasarkanResponden from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanResponden';
import colors from '@/con/colors';
import { Box, Center, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikBerdasarkanResponden() {
  const stategrafikBerdasarkanResponden = useProxy(grafikBerdasarkanResponden)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [])

  const updateChartData = (data: any) => {
    if (data && data.length > 0) {
      const totalSangatBaik = data.reduce((acc: number, cur: any) => acc + Number(cur.sangatbaik || 0), 0);
      const totalBaik = data.reduce((acc: number, cur: any) => acc + Number(cur.baik || 0), 0);
      const totalKurangBaik = data.reduce((acc: number, cur: any) => acc + Number(cur.kurangbaik || 0), 0);
      const totalTidakBaik = data.reduce((acc: number, cur: any) => acc + Number(cur.tidakbaik || 0), 0);
      setDonutData([
        { name: 'sangatbaik', value: totalSangatBaik, color: colors['blue-button'], key: 'sangatbaik' },
        { name: 'baik', value: totalBaik, color: '#10A85AFF', key: 'baik' },
        { name: 'kurangbaik', value: totalKurangBaik, color: '#B3AA12FF', key: 'kurangbaik' },
        { name: 'tidakbaik', value: totalTidakBaik, color: '#B21313FF', key: 'tidakbaik' }
      ]);
    }
  };

  useShallowEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await stategrafikBerdasarkanResponden.findMany.load();
    if (stategrafikBerdasarkanResponden.findMany.data) {
      updateChartData(stategrafikBerdasarkanResponden.findMany.data);
    }
  };

  if (!stategrafikBerdasarkanResponden.findMany.data) return <Stack>
    <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
    <Skeleton h={500} />
  </Stack>
  return (
    <Stack>
      <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
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
            <Text>Sangat Baik: {donutData.find((entry) => entry.name === 'sangatbaik')?.value}</Text>
          </Flex>
          <Flex gap={"md"} align={"center"}>
            <Box bg={'#10A85AFF'} w={20} h={20} />
            <Text>Baik: {donutData.find((entry) => entry.name === 'baik')?.value}</Text>
          </Flex>
          <Flex gap={"md"} align={"center"}>
            <Box bg={'#B3AA12FF'} w={20} h={20} />
            <Text>Kurang Baik: {donutData.find((entry) => entry.name === 'kurangbaik')?.value}</Text>
          </Flex>
          <Flex gap={"md"} align={"center"}>
            <Box bg={'#B21313FF'} w={20} h={20} />
            <Text>Tidak Baik: {donutData.find((entry) => entry.name === 'tidakbaik')?.value}</Text>
          </Flex>
        </Box>
      )}
    </Stack>
  );
}

export default GrafikBerdasarkanResponden;
