'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import statePersentase from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, TextInput, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';

function PersentaseDataKelahiranKematian() {
  const persentase = useProxy(statePersentase.persentasekelahiran);
  const [chartData, setChartData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    setMounted(true);
  }, []);

  useShallowEffect(() => {
    const fetchData = async () => {
      await persentase.findMany.load();
      if (persentase.findMany.data && persentase.findMany.data.length > 0) {
        setChartData(persentase.findMany.data);
      }
    };
    fetchData();
  }, []);

  return (
    <Stack py={10}>
      {/* Form Input */}
      <Box>
        <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
          <Title order={4}>Tambah Persentase Data Kelahiran & Kematian</Title>
          <Stack gap={"xs"}>
            <TextInput
              label="Tahun"
              type="number"
              value={persentase.create.form.tahun}
              placeholder="Masukkan tahun"
              onChange={(val) => {
                persentase.create.form.tahun = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Kematian Kasar"
              type="number"
              value={persentase.create.form.kematianKasar}
              placeholder="Masukkan kematian kasar"
              onChange={(val) => {
                persentase.create.form.kematianKasar = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Kematian Bayi"
              type="number"
              value={persentase.create.form.kematianBayi}
              placeholder="Masukkan kematian bayi"
              onChange={(val) => {
                persentase.create.form.kematianBayi = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Kelahiran Kasar"
              type="number"
              value={persentase.create.form.kelahiranKasar}
              placeholder="Masukkan kelahiran kasar"
              onChange={(val) => {
                persentase.create.form.kelahiranKasar = val.currentTarget.value;
              }}
            />
            <Group>
              <Button
                bg={colors['blue-button']}
                mt={10}
                onClick={async () => {
                  await persentase.create.create();
                  await persentase.findMany.load();
                  if (persentase.findMany.data) {
                    setChartData(persentase.findMany.data);
                  }
                }}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Box>

      {/* Chart */}
      {!mounted && !chartData ? (
        <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
          <Paper bg={colors['white-1']} p={'md'}>
            <Title pb={10} order={3}>Data Kelahiran & Kematian</Title>
            <Skeleton h={400} />
          </Paper>
        </Box>
      ) : (
        <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
          <Paper bg={colors['white-1']} p={'md'}>
            <Title pb={10} order={4}>Data Kelahiran & Kematian</Title>
            {mounted && chartData.length > 0 && (
              <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={chartData} >
                <XAxis dataKey="tahun" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="kematianKasar" fill="#f03e3e" name="Kematian Kasar" />
                <Bar dataKey="kematianBayi" fill="#ff922b" name="Kematian Bayi" />
                <Bar dataKey="kelahiranKasar" fill="#4dabf7" name="Kelahiran Kasar" />
              </BarChart>
            )}
          </Paper>
        </Box>
      )}
    </Stack>
  );
}

export default PersentaseDataKelahiranKematian;
