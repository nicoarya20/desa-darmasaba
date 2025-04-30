'use client'
import stategrafikKepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { Bar, Legend, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikHasilKepuasan() {
  const grafikkepuasan = useProxy(stategrafikKepuasan.grafikkepuasan)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  return (
    <Stack gap={"xs"}>
      <Title order={3}>Grafik Hasil Kepuasan</Title>
      <Box>
        <TextInput
          label="Label"
          placeholder='Masukkan label yang diinginkan'
          value={grafikkepuasan.create.form.label}
          onChange={(val) => {
            grafikkepuasan.create.form.label = val.currentTarget.value
          }}
        />
        <TextInput
          label="Jumlah Penderita Farangitis Akut"
          type='number'
          placeholder='Masukkan jumlah penderita farangitis akut'
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
        <Title order={3}>Data Kelahiran & Kematian</Title>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
          data={chartData}
          >
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="jumlah" fill={colors['blue-button']} name="Jumlah" />
          </RadialBarChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  );
}

export default GrafikHasilKepuasan;
