/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import stategrafikKepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, TextInput, Title } from '@mantine/core';
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
    <Stack py={10} gap={"xs"}>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Title order={4}>Tambah Grafik Hasil Kepuasan</Title>
        <Stack gap={"xs"}>
          <TextInput
            label="Label"
            placeholder='Masukkan label yang diinginkan'
            value={grafikkepuasan.create.form.label}
            onChange={(val) => {
              grafikkepuasan.create.form.label = val.currentTarget.value
            }}
          />
          <TextInput
            label="Jumlah Penderita"
            type='number'
            placeholder='Masukkan jumlah penderita'
            value={grafikkepuasan.create.form.jumlah}
            onChange={(val) => {
              grafikkepuasan.create.form.jumlah = val.currentTarget.value
            }}
          />
          <Group>
            <Button bg={colors['blue-button']} mt={10}
              onClick={async () => {
                await grafikkepuasan.create.create();
                await grafikkepuasan.findMany.load();
                if (grafikkepuasan.findMany.data) {
                  setChartData(grafikkepuasan.findMany.data);
                }
              }}
            >Submit</Button>
          </Group>
        </Stack>
      </Paper>
      {!chartData ? (
        <Box style={{ width: '100%', minWidth: 300, minHeight: 300 }}>
          <Paper bg={colors['white-1']} p={'md'}>
            <Title py={15} order={4}>Data Hasil Kepuasan</Title>
            <Skeleton h={400} />
          </Paper>
        </Box>
      ) : (
        <Box style={{ width: '100%', minWidth: 300, minHeight: 300 }}>
          <Paper bg={colors['white-1']} p={'md'}>
            <Title py={15} order={4}>Data Hasil Kepuasan</Title>
            <BarChart
              width={isMobile ? 250 : isTablet ? 300 : 350}
              height={380}
              data={chartData}
            >
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="jumlah" fill={colors['blue-button']} name="Jumlah" />
            </BarChart>
          </Paper>
        </Box>
      )}
    </Stack>
  );
}

export default GrafikHasilKepuasan;
