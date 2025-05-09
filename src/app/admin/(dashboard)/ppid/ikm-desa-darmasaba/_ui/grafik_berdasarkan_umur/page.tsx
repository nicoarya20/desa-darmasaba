'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateGrafikBerdasarkanUmur from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanUmur';
import { useShallowEffect } from '@mantine/hooks';
import { PieChart, Pie, Cell } from 'recharts';

function GrafikBerdasarakanUmur() {
  const grafikBerdasarkanUmur = useProxy(stateGrafikBerdasarkanUmur.grafikBerdasarkanUmur)
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
    await grafikBerdasarkanUmur.findMany.load();
    if (grafikBerdasarkanUmur.findMany.data) {
      updateChartData(grafikBerdasarkanUmur.findMany.data);
    }
  }

  const handleSubmit = async () => {
    try {
      await grafikBerdasarkanUmur.create.create();
      await grafikBerdasarkanUmur.findMany.load();
      if (grafikBerdasarkanUmur.findMany.data) {
        updateChartData(grafikBerdasarkanUmur.findMany.data);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  }
  return (
    <Box>
      <Box py={15}>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Stack gap={"xs"}>
            <Title order={3}>Grafik Berdasarkan Umur Responden</Title>
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Remaja"
              placeholder="masukkan jumlah responden remaja"
              value={grafikBerdasarkanUmur.create.form.remaja}
              onChange={(val) => {
                grafikBerdasarkanUmur.create.form.remaja = val.currentTarget.value;
              }}
            />
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Dewasa"
              placeholder="masukkan jumlah responden dewasa"
              value={grafikBerdasarkanUmur.create.form.dewasa}
              onChange={(val) => {
                grafikBerdasarkanUmur.create.form.dewasa = val.currentTarget.value;
              }}
            />
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Orangtua"
              placeholder="masukkan jumlah responden orangtua"
              value={grafikBerdasarkanUmur.create.form.orangtua}
              onChange={(val) => {
                grafikBerdasarkanUmur.create.form.orangtua = val.currentTarget.value;
              }}
            />
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Lansia"
              placeholder="masukkan jumlah responden lansia"
              value={grafikBerdasarkanUmur.create.form.lansia}
              onChange={(val) => {
                grafikBerdasarkanUmur.create.form.lansia = val.currentTarget.value;
              }}
            />
            <Group>
              <Button
                mt={10}
                bg={colors['blue-button']}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Box>

      {/* Chart */}
      <Box>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Stack>
            <Title pb={10} order={3}>Grafik Berdasarkan Umur Responden</Title>
            {mounted && donutData.length > 0 && (
              <Box style={{ width: '100%', height: 'auto', minHeight: 900 }}>
                <Center>
                  <PieChart
                    width={1000} height={400}
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
        </Paper>
      </Box>
    </Box>
  );
}

export default GrafikBerdasarakanUmur;
