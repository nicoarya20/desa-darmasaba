import colors from '@/con/colors';
import { Stack, Box, Text, Center, Paper, ColorSwatch, Flex } from '@mantine/core';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { PieChart } from '@mantine/charts';

const datausiaKerja = [
  {
    id: 1,
    name: '18 - 25',
    value: 45,
    color: 'indigo.6'
  },
  {
    id: 2,
    name: '26 - 35',
    value: 35,
    color: 'teal.6'
  },
  {
    id: 3,
    name: '36 - 45',
    value: 15,
    color: 'yellow.6'
  },
  {
    id: 4,
    name: '46+',
    value: 5,
    color: 'red.6'
  },
]
const datakerjaPendidikan = [
  {
    id: 1,
    name: 'SD',
    value: 10,
    color: 'indigo.6'
  },
  {
    id: 2,
    name: 'SMP',
    value: 20,
    color: 'teal.6'
  },
  {
    id: 3,
    name: 'SMA/SMK',
    value: 45,
    color: 'yellow.6'
  },
  {
    id: 4,
    name: 'D3/S1',
    value: 25,
    color: 'red.6'
  },
]
function Page() {
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
            <Center>
              <PieChart size={300} withLabelsLine labelsPosition="outside" labelsType="percent" withLabels data={datausiaKerja} withTooltip tooltipDataSource="segment" mx="auto" />
            </Center>
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
            <Center>
              <PieChart size={300} withLabelsLine labelsPosition="outside" labelsType="percent" withLabels data={datakerjaPendidikan} withTooltip tooltipDataSource="segment" mx="auto" />
            </Center>
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
                  <Text fw={'bold'} fz={{ base: 'md', md: 'h4' }}>D3/S1</Text>
                  <ColorSwatch color="#DB524D" size={30} />
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
