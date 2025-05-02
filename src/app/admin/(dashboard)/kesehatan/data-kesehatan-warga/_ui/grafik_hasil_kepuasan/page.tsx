/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import stategrafikKepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikHasilKepuasan() {
  const grafikkepuasan = useProxy(stategrafikKepuasan.grafikkepuasan)
  const [mounted, setMounted] = useState(false);
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [chartData, setChartData] = useState<any[]>([])

  useShallowEffect(() => {
    const fetchData = async () => {
      await grafikkepuasan.findMany.load();
      if (grafikkepuasan.findMany.data && grafikkepuasan.findMany.data.length > 0) {
        setChartData(grafikkepuasan.findMany.data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setMounted(true); // setelah komponen siap di client
  }, []);

  if (!mounted) {
    return null; // Jangan render apa-apa dulu sebelum mounted
  }


  return (
    <Stack gap={"xs"}>
      <Title order={3}>Grafik Hasil Kepuasan</Title>
      <Box>
        <TextInput
          w={{ base: '100%', md: '50%' }}
          label="Label"
          placeholder='Masukkan label yang diinginkan'
          value={grafikkepuasan.create.form.label}
          onChange={(val) => {
            grafikkepuasan.create.form.label = val.currentTarget.value
          }}
        />
        <TextInput
          w={{ base: '100%', md: '50%' }}
          label="Jumlah Penderita"
          type='number'
          placeholder='Masukkan jumlah penderita'
          value={grafikkepuasan.create.form.jumlah}
          onChange={(val) => {
            grafikkepuasan.create.form.jumlah = val.currentTarget.value
          }}
        />
      </Box>
      <Group>
        <Button mt={10}
          onClick={async () => {
            await grafikkepuasan.create.create();
            await grafikkepuasan.findMany.load();
            if (grafikkepuasan.findMany.data) {
              setChartData(grafikkepuasan.findMany.data);
            }
          }}
        >Submit</Button>
      </Group>
      <Box h={400} w={{ base: "100%", md: "80%" }}>
        <Title py={15} order={3}>Data Kelahiran & Kematian</Title>
        <BarChart
          width={isMobile ? 450 : isTablet ? 600 : 900}
          height={380}
          data={chartData}
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="jumlah" fill={colors['blue-button']} name="Jumlah" />
        </BarChart>
      </Box>
    </Stack>
  );
}

export default GrafikHasilKepuasan;
