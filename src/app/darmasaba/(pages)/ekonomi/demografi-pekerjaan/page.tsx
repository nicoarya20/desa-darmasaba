'use client'
import colors from '@/con/colors';
import { Stack, Box, Paper, Text, ColorSwatch, Flex, Skeleton, Title } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { BarChart } from '@mantine/charts';
import { useProxy } from 'valtio/utils';
import grafikDemografiPekerjaan from '@/app/admin/(dashboard)/_state/ekonomi/demografi-pekerjaan';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const state = useProxy(grafikDemografiPekerjaan)

  const {
    data,
  } = state.findMany

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  if (!data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Title
          order={1}
          ta="center"
          c={colors["blue-button"]}
          fw="bold"
          lh={1.2}
          style={{ lineHeight: 1.2 }}
        >
          Demografi Pekerjaan
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          c="black"
          style={{ lineHeight: 1.5 }}
        >
          Desa Darmasaba memiliki komposisi penduduk yang beragam dalam sektor pekerjaan
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'} justify='center'>
          <Paper p={'xl'}>
            <Box style={{ overflowX: 'auto' }} w={"100%"}>
              <Text
                pb={5}
                fw={'bold'}
                fz={{ base: 'md', md: 'lg' }}
                lh={1.2}
                c="black"
                style={{ lineHeight: 1.2 }}
              >
                Statistik Demografi Pekerjaan Di Desa Darmasaba
              </Text>
              <BarChart
                type='stacked'
                p={10}
                mb={50}
                h={400}
                w={Math.max(data.length * 120, 800)}
                data={data.map((item) => ({
                  id: item.id,
                  Pekerjaan: item.pekerjaan,
                  laki: item.lakiLaki,
                  perempuan: item.perempuan,
                }))}
                dataKey="Pekerjaan"
                series={[
                  { name: 'laki', color: '#5082EE' },
                  { name: 'perempuan', color: '#6EDF9C' },
                ]}
                tickLine="y"
                xAxisProps={{
                  angle: -45,
                  textAnchor: 'end',
                  height: 100,
                  interval: 0,
                  style: {
                    fontSize: '12px',
                    overflow: 'visible',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }
                }}
              />
            </Box>
            <Flex pb={30} justify={'center'} gap={'xl'} align={'center'}>
              <Box>
                <Flex gap={{ base: 7, md: 5 }} align={'center'}>
                  <Text
                    fw={'bold'}
                    fz={{ base: 'sm', md: 'md' }}
                    lh={1.2}
                    c="black"
                    style={{ lineHeight: 1.2 }}
                  >
                    Laki-Laki
                  </Text>
                  <ColorSwatch color="#5082EE" size={30} />
                </Flex>
              </Box>
              <Box>
                <Flex gap={{ base: 7, md: 5 }} align={'center'}>
                  <Text
                    fw={'bold'}
                    fz={{ base: 'sm', md: 'md' }}
                    lh={1.2}
                    c="black"
                    style={{ lineHeight: 1.2 }}
                  >
                    Perempuan
                  </Text>
                  <ColorSwatch color="#6EDF9C" size={30} />
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