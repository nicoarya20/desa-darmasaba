/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import stateGrafikHasilKepuasanMasyarakat from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikHasilKepuasan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikHasilKepuasan() {
  const grafikHasilKepuasan = useProxy(stateGrafikHasilKepuasanMasyarakat.grafikHasilKepuasanMasyarakat)
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    setMounted(true);
  }, [])

  useShallowEffect(() => {
    const fetchData = async () => {
      await grafikHasilKepuasan.findMany.load();
      if (grafikHasilKepuasan.findMany.data && grafikHasilKepuasan.findMany.data.length > 0) {
        setChartData(grafikHasilKepuasan.findMany.data);
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Box py={15}>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Stack>
            <Title order={3}>Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik</Title>
            <TextInput
              label="Label"
              placeholder="masukkan label"
              value={grafikHasilKepuasan.create.form.label}
              onChange={(val) => {
                grafikHasilKepuasan.create.form.label = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Jumlah Kepuasan"
              type="number"
              placeholder="masukkan jumlah kepuasan"
              value={grafikHasilKepuasan.create.form.kepuasan}
              onChange={(val) => {
                grafikHasilKepuasan.create.form.kepuasan = val.currentTarget.value;
              }}
            />
            <Button
              mt={10}
              bg={colors['blue-button']}
              onClick={async () => {
                await grafikHasilKepuasan.create.create();
                await grafikHasilKepuasan.findMany.load();
                if (grafikHasilKepuasan.findMany.data) {
                  setChartData(grafikHasilKepuasan.findMany.data);
                }
              }}
            >
              Submit
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* Chart */}
      <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
        <Paper style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }} bg={colors['white-1']} p={'md'}>
          <Stack gap={"xs"}>
            <Title pb={10} order={3}>Data Kepuasan Masyarakat</Title>
            {mounted && chartData.length > 0 && (
              <BarChart width={isMobile ? 300 : isTablet ? 600 : 900} height={380} data={chartData} >
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="kepuasan" fill={colors['blue-button']} name="Kepuasan" />
              </BarChart>
            )}
          </Stack>
        </Paper>
      </Box>

    </Box>
  );
}

export default GrafikHasilKepuasan;
