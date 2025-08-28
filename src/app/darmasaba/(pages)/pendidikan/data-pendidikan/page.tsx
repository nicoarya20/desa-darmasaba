'use client'
import dataPendidikan from '@/app/admin/(dashboard)/_state/pendidikan/data-pendidikan';
import { Box, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSchool } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import colors from '@/con/colors';

function Page() {
  type DPMrafik = {
    id: string;
    name: string;
    jumlah: number;
  };

  const stateDPM = useProxy(dataPendidikan);
  const [chartData, setChartData] = useState<DPMrafik[]>([]);
  const [mounted, setMounted] = useState(false);

  useShallowEffect(() => {
    setMounted(true);
    stateDPM.findMany.load();
  }, []);

  useEffect(() => {
    if (stateDPM.findMany.data) {
      setChartData(
        stateDPM.findMany.data.map((item) => ({
          id: item.id,
          name: item.name,
          jumlah: Number(item.jumlah),
        }))
      );
    }
  }, [stateDPM.findMany.data]);

  if (!stateDPM.findMany.data) {
    return (
      <Stack px="md" py="xl">
        <Skeleton h={400} radius="lg" />
      </Stack>
    );
  }

  return (
    <Stack bg="var(--mantine-color-gray-0)" py="xl" gap="lg" pos="relative">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="xs" align="center" pb="lg">
          <IconSchool size={48} stroke={1.5} color={colors['blue-button']} />
          <Title order={1} fw={700} ta="center" c={colors['blue-button']}>
            Statistik Data Pendidikan
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Visualisasi jumlah pendidikan berdasarkan kategori yang tersedia
          </Text>
        </Stack>

        {!mounted || chartData.length === 0 ? (
          <Paper radius="lg" p="xl" withBorder shadow="sm" bg="var(--mantine-color-white)">
            <Stack align="center" gap="sm" justify="center" h={350}>
              <IconSchool size={40} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Title order={4} fw={600}>
                Belum Ada Data
              </Title>
              <Text c="dimmed" size="sm">
                Data pendidikan belum tersedia. Silakan tambahkan data untuk melihat grafik.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Paper radius="lg" p="xl" withBorder shadow="sm" bg="var(--mantine-color-white)">
            <Title order={4} fw={600} mb="md">
              Grafik Pendidikan
            </Title>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    background: 'var(--mantine-color-gray-0)',
                    border: '1px solid var(--mantine-color-gray-3)',
                  }}
                  cursor={{ fill: 'var(--mantine-color-gray-1)' }}
                />
                <Legend />
                <Bar dataKey="jumlah" fill={colors['blue-button']} name="Jumlah Pendidikan" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Box>
    </Stack>
  );
}

export default Page;
