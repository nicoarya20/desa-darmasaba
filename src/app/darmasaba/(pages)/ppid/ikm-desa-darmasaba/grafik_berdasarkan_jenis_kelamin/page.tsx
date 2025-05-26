/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react';
import { Box, Center, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { Cell, Pie, PieChart } from 'recharts';
import colors from '@/con/colors';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import stateGrafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';

function GrafikBerdasarkanJenisKelamin() {
  const grafikBerdasarkanJenisKelamin = useProxy(stateGrafikBerdasarkanJenisKelamin.grafikBerdasarkanJenisKelamin)
  const [mounted, setMounted] = useState(false);
  const [donutData, setDonutData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, [])

  const updateChartData = (data: any) => {
    if (data && data.length > 0) {
      const totalLaki = data.reduce((acc: number, cur: any) => acc + Number(cur.laki || 0), 0);
      const totalPerempuan = data.reduce((acc: number, cur: any) => acc + Number(cur.perempuan || 0), 0);

      setDonutData([
        { name: 'Laki-laki', value: totalLaki, color: colors['blue-button'], key: 'laki-laki' },
        { name: 'Perempuan', value: totalPerempuan, color: '#FF6384', key: 'perempuan' }
      ]);
    }
  };

  useShallowEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await grafikBerdasarkanJenisKelamin.findMany.load();
    if (grafikBerdasarkanJenisKelamin.findMany.data) {
      updateChartData(grafikBerdasarkanJenisKelamin.findMany.data);
    }
  };

  if(!grafikBerdasarkanJenisKelamin.findMany.data) return <Stack>
    <Title pb={10} order={3}>Grafik Berdasarkan Jenis Kelamin Responden</Title>
   <Skeleton h={500} />
  </Stack>

  return (
    <Stack gap={"xl"}>
            <Title pb={10} order={3}>Grafik Berdasarkan Jenis Kelamin Responden</Title>
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
                  <Box bg={'#FF6384'} w={20} h={20} />
                  <Text>Perempuan: {donutData.find((entry) => entry.name === 'Perempuan')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={colors['blue-button']} w={20} h={20} />
                  <Text>Laki-laki: {donutData.find((entry) => entry.name === 'Laki-laki')?.value}</Text>
                </Flex>
              </Box>
            )}
          </Stack>
  );
}

export default GrafikBerdasarkanJenisKelamin;
