/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import stateGrafikBerdasarkanJenisKelamin from '@/app/admin/(dashboard)/_state/ppid/indeks_kepuasan_masyarakat/grafikBerdasarkanJenisKelamin';
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { useProxy } from 'valtio/utils';

function GrafikBerdasarkanJenisKelamin() {
  const grafikBerdasarkanJenisKelamin = useProxy(stateGrafikBerdasarkanJenisKelamin.grafikBerdasarkanJenisKelamin)
  const [donutData, setDonutData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [])

  const updateChartData = (data: any) => {
    if (data && data.length > 0) {
      const totalLaki = data.reduce((acc: number, cur: any) => acc + Number(cur.laki || 0), 0);
      const totalPerempuan = data.reduce((acc: number, cur: any) => acc + Number(cur.perempuan || 0), 0);

      setDonutData([
        { name: 'Laki-laki', value: totalLaki, color: colors['blue-button'], key: 'laki-laki' },
        { name: 'Perempuan', value: totalPerempuan, color: '#FF6384', key: 'perempuan' }
      ]);
    }
  };

  useShallowEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await grafikBerdasarkanJenisKelamin.findMany.load();
    if (grafikBerdasarkanJenisKelamin.findMany.data) {
      updateChartData(grafikBerdasarkanJenisKelamin.findMany.data);
    }
  };

  const handleSubmit = async () => {
    try {
      // Simpan data baru
      await grafikBerdasarkanJenisKelamin.create.create();

      // Muat ulang data
      await grafikBerdasarkanJenisKelamin.findMany.load();

      // Update chart dengan data baru
      if (grafikBerdasarkanJenisKelamin.findMany.data) {
        updateChartData(grafikBerdasarkanJenisKelamin.findMany.data);
      }

      // Reset form setelah submit
      grafikBerdasarkanJenisKelamin.create.form.laki = '';
      grafikBerdasarkanJenisKelamin.create.form.perempuan = '';
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <Box>
      <Box py={15}>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Title order={3}>Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik</Title>
          <TextInput
            w={{ base: '100%', md: '50%' }}
            label="Laki-laki"
            placeholder="masukkan jumlah laki-laki"
            value={grafikBerdasarkanJenisKelamin.create.form.laki}
            onChange={(val) => {
              grafikBerdasarkanJenisKelamin.create.form.laki = val.currentTarget.value;
            }}
          />
          <TextInput
            w={{ base: '100%', md: '50%' }}
            label="Perempuan"
            type="number"
            placeholder="masukkan jumlah perempuan"
            value={grafikBerdasarkanJenisKelamin.create.form.perempuan}
            onChange={(val) => {
              grafikBerdasarkanJenisKelamin.create.form.perempuan = val.currentTarget.value;
            }}
          />
          <Button
            mt={10}
            bg={colors['blue-button']}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Paper>
      </Box>

      {/* Chart */}
      <Box>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Stack>
            <Title pb={10} order={3}>Grafik Berdasarkan Jenis Kelamin Responden</Title>
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
                  <Box bg={'#FF6384'} w={20} h={20} />
                  <Text>Perempuan: {donutData.find((entry) => entry.name === 'Perempuan')?.value}</Text>
                </Flex>
                <Flex gap={"md"} align={"center"}>
                  <Box bg={colors['blue-button']} w={20} h={20} />
                  <Text>Laki-laki: {donutData.find((entry) => entry.name === 'Laki-laki')?.value}</Text>
                </Flex>
              </Box>
            )}
          </Stack>
          </Paper>
      </Box>
    </Box>
  );
}

export default GrafikBerdasarkanJenisKelamin;
