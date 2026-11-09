/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
import colors from '@/con/colors';
import { PieChart } from '@mantine/charts';
import { Box, Center, ColorSwatch, Flex, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

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

  if (!stateGrafikNganggur.findMany.data || !stateGrafikNganggurPendidikan.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22" style={{ overflow: 'auto' }}>
      <Box px={{ base: 'md', md: 50, lg: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 50, lg: 100 }}>
        <Title
          order={1}
          ta="center"
          c={colors["blue-button"]}
          fw="bold"
          style={{ lineHeight: 1.15 }}
        >
          Jumlah Penduduk Usia Kerja Yang Menganggur
        </Title>
      </Box>
      <Box px={{ base: "md", md: 50, lg: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper p={'lg'}>
            <Title
              order={2}
              fw="bold"
              style={{ lineHeight: 1.2 }}
            >
              Pengangguran Berdasarkan Usia
            </Title>
            {mounted && donutGrafikNganggurData.length > 0 ? (
              <Box style={{ width: '100%', height: 'auto', minHeight: 200 }}>
                <Box w="100%" maw={{ base: '100%', md: 400 }} mx="auto">
                  <PieChart
                    w="100%"
                    h={250}
                    withLabelsLine
                    labelsPosition="outside"
                    labelsType="percent"
                    withLabels
                    data={donutGrafikNganggurData}
                    withTooltip
                    tooltipDataSource="segment"
                  />
                </Box>
              </Box>
            ) : (
              <Skeleton h={500} />
            )}
            <Flex pb={30} justify={'center'} gap={'xl'} align={'center'} wrap="wrap">
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    18-25
                  </Text>
                  <ColorSwatch color="#4b6Ef5" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    26-35
                  </Text>
                  <ColorSwatch color="#14b885" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    36-45
                  </Text>
                  <ColorSwatch color="#E6A03B" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    46+
                  </Text>
                  <ColorSwatch color="#DB524D" size={30} />
                </Flex>
              </Box>
            </Flex>
          </Paper>
          <Paper p={'lg'}>
            <Title
              order={2}
              fw="bold"
              style={{ lineHeight: 1.2 }}
            >
              Pengangguran Berdasarkan Pendidikan
            </Title>
            {mounted2 && donutGrafikNganggurDataPendidikan.length > 0 ? (
              <Center>
                <Box w="100%" style={{ maxWidth: 400, margin: "0 auto" }}>
                  <PieChart
                    w="100%"
                    h="min(250px, 50vh)"
                    withLabelsLine
                    labelsPosition="outside"
                    labelsType="percent"
                    withLabels
                    data={donutGrafikNganggurDataPendidikan}
                    withTooltip
                    tooltipDataSource="segment"
                  />
                </Box>
              </Center>
            ) : (
              <Skeleton h={500} />
            )}
            <Flex pb={30} justify={'center'} gap={'xl'} align={'center'} wrap="wrap">
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    SD
                  </Text>
                  <ColorSwatch color="#4b6Ef5" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    SMP
                  </Text>
                  <ColorSwatch color="#14b885" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    SMA/SMK
                  </Text>
                  <ColorSwatch color="#E6A03B" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    D3
                  </Text>
                  <ColorSwatch color="#DB524D" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 5, md: 8 }} align={'center'} wrap="wrap">
                  <Text fw={'bold'} fz={{ base: 'sm', md: 'md' }} style={{ lineHeight: 1.45 }}>
                    S1
                  </Text>
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