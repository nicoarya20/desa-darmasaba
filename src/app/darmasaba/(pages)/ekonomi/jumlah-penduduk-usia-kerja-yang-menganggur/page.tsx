/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
import colors from '@/con/colors';
import { PieChart } from '@mantine/charts';
import { Box, Center, ColorSwatch, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const stateGrafikNganggur = useProxy(grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur)
  const stateGrafikNganggurPendidikan = useProxy(grafikNganggur.grafikBerdasarkanPendidikan)
  const [donutGrafikNganggurData, setDonutGrafikNganggurData] = useState<any[]>([])
  const [donutGrafikNganggurDataPendidikan, setDonutGrafikNganggurDataPendidikan] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [mounted2, setMounted2] = useState(false)

  useShallowEffect(() => {
    setMounted(true)
    setMounted2(true)
    stateGrafikNganggur.findMany.load()
    stateGrafikNganggurPendidikan.findMany.load()
  }, [])

  useEffect(() => {
    if (stateGrafikNganggur.findMany.data) {
      const totalUsia18_25 = stateGrafikNganggur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia18_25 || 0), 0);
      const totalUsia26_35 = stateGrafikNganggur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia26_35 || 0), 0);
      const totalUsia36_45 = stateGrafikNganggur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia36_45 || 0), 0);
      const totalUsia46_keatas = stateGrafikNganggur.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.usia46_keatas || 0), 0);
      setDonutGrafikNganggurData([
        { name: 'usia 18 - 25', value: totalUsia18_25, color: '#4b6Ef5', key: 'usia18_25' },
        { name: 'usia 26 - 35', value: totalUsia26_35, color: '#14b885', key: 'usia26_35' },
        { name: 'usia 36 - 45', value: totalUsia36_45, color: '#E6A03B', key: 'usia36_45' },
        { name: 'usia 46 +', value: totalUsia46_keatas, color: '#DB524D', key: 'usia46_keatas' },
      ])
    }
  }, [stateGrafikNganggur.findMany.data])

  useEffect(() => {
    if (stateGrafikNganggurPendidikan.findMany.data) {
      const SD = stateGrafikNganggurPendidikan.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.SD || 0), 0);
      const SMP = stateGrafikNganggurPendidikan.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.SMP || 0), 0);
      const SMA = stateGrafikNganggurPendidikan.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.SMA || 0), 0);
      const D3 = stateGrafikNganggurPendidikan.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.D3 || 0), 0);
      const S1 = stateGrafikNganggurPendidikan.findMany.data.reduce((acc: number, cur: any) => acc + Number(cur.S1 || 0), 0);
      setDonutGrafikNganggurDataPendidikan([
        { name: 'SD', value: SD, color: '#4b6Ef5', key: 'SD' },
        { name: 'SMP', value: SMP, color: '#14b885', key: 'SMP' },
        { name: 'SMA', value: SMA, color: '#E6A03B', key: 'SMA' },
        { name: 'D3', value: D3, color: '#DB524D', key: 'D3' },
        { name: 'S1', value: S1, color: '#1018A8FF', key: 'S1' },
      ]);
    }
  }, [stateGrafikNganggurPendidikan.findMany.data])

  if (!stateGrafikNganggur.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }

  if (!stateGrafikNganggur.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Jumlah Penduduk Usia Kerja Yang Menganggur
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper p={'lg'}>
            <Text fw={'bold'} fz={'h3'}>Pengangguran Berdasarkan Usia</Text>
            {mounted && donutGrafikNganggurData.length > 0 ? (<Box style={{ width: '100%', height: 'auto', minHeight: 200 }}>
              <PieChart
                size={300}
                withLabelsLine
                labelsPosition="outside"
                labelsType="percent"
                withLabels
                data={donutGrafikNganggurData}
                withTooltip
                tooltipDataSource="segment"
                mx="auto" />
            </Box>) : <Skeleton h={500} />}
            <Flex pb={30} justify={'center'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>18-25</Text>
                  <ColorSwatch color="#4b6Ef5" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>26-35</Text>
                  <ColorSwatch color="#14b885" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>36-45</Text>
                  <ColorSwatch color="#E6A03B" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>46+</Text>
                  <ColorSwatch color="#DB524D" size={30} />
                </Flex>
              </Box>
            </Flex>
          </Paper>
          <Paper p={'lg'}>
            <Text fw={'bold'} fz={'h3'}>Pengangguran Berdasarkan Pendidikan</Text>
            {mounted2 && donutGrafikNganggurDataPendidikan.length > 0 ? (<Center>
              <PieChart
                size={300}
                withLabelsLine
                labelsPosition="outside"
                labelsType="percent"
                withLabels
                data={donutGrafikNganggurDataPendidikan}
                withTooltip
                tooltipDataSource="segment"
                mx="auto" />
            </Center>) : <Skeleton h={500} />}
            <Flex pb={30} justify={'center'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>SD</Text>
                  <ColorSwatch color="#4b6Ef5" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>SMP</Text>
                  <ColorSwatch color="#14b885" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>SMA/SMK</Text>
                  <ColorSwatch color="#E6A03B" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>D3</Text>
                  <ColorSwatch color="#DB524D" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'}>
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>S1</Text>
                  <ColorSwatch color="#1018A8FF" size={30} />
                </Flex>
              </Box>
            </Flex>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
