'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import stateGrafikResponden from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanResponden';
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikBerdasarkanResponden() {
  const grafikBerdasarkanResponden = useProxy(stateGrafikResponden.grafikBerdasarkanResponden)
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
    await grafikBerdasarkanResponden.findMany.load();
    if (grafikBerdasarkanResponden.findMany.data) {
      updateChartData(grafikBerdasarkanResponden.findMany.data);
    }
  };

  const handleSubmit = async () => {
    try {
      // Simpan data baru
      await grafikBerdasarkanResponden.create.create();

      // Muat ulang data
      await grafikBerdasarkanResponden.findMany.load();

      // Update chart dengan data baru
      if (grafikBerdasarkanResponden.findMany.data) {
        updateChartData(grafikBerdasarkanResponden.findMany.data);
      }

      // Reset form setelah submit
      grafikBerdasarkanResponden.create.form.sangatbaik = '';
      grafikBerdasarkanResponden.create.form.baik = '';
      grafikBerdasarkanResponden.create.form.kurangbaik = '';
      grafikBerdasarkanResponden.create.form.tidakbaik = '';
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  return (
    <Box>
      <Box py={15}>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Stack gap={"xs"}>
            <Title order={3}>Grafik Berdasarkan Responden</Title>
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Sangat Baik"
              value={grafikBerdasarkanResponden.create.form.sangatbaik}
              placeholder="masukkan jumlah respon sangat baik"
              onChange={(val) => {
                grafikBerdasarkanResponden.create.form.sangatbaik = val.currentTarget.value;
              }}
            />
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Baik"
              value={grafikBerdasarkanResponden.create.form.baik}
              placeholder="masukkan jumlah respon baik"
              onChange={(val) => {
                grafikBerdasarkanResponden.create.form.baik = val.currentTarget.value;
              }}
            />
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Kurang Baik"
              value={grafikBerdasarkanResponden.create.form.kurangbaik}
              placeholder="masukkan jumlah respon kurang baik"
              onChange={(val) => {
                grafikBerdasarkanResponden.create.form.kurangbaik = val.currentTarget.value;
              }}
            />
            <TextInput
              w={{ base: '100%', md: '50%' }}
              label="Tidak Baik"
              value={grafikBerdasarkanResponden.create.form.tidakbaik}
              placeholder="masukkan jumlah respon tidak baik"
              onChange={(val) => {
                grafikBerdasarkanResponden.create.form.tidakbaik = val.currentTarget.value;
              }}
            />
            <Group>
              <Button
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
            <Title pb={10} order={3}>Grafik Berdasarkan Responden</Title>
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
        </Paper>
      </Box>
    </Box>
  );
}

export default GrafikBerdasarkanResponden;
