'use client'
import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Title, Skeleton, Center } from '@mantine/core';
import { IconDatabaseOff } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import distribusiUmur from '@/app/admin/(dashboard)/_state/kependudukan/distribusi-umur';
import { useShallowEffect } from '@mantine/hooks';
import { BarChart } from '@mantine/charts';

function Page() {
  const state = useProxy(distribusiUmur)

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  interface DistribusiUmurItem {
    id: string;
    rentangUmur: string;
    jumlah: number;
    tahun: number;
  }

  const data = (state.findMany.data as DistribusiUmurItem[]) || [];

  if (state.findMany.loading) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"lg"}>
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
          >
            Distribusi Umur
          </Title>
          <Text
            ta="center"
            fz={{ base: 'sm', md: 'md' }}
            lh={1.5}
            c="black"
          >
            Komposisi penduduk berdasarkan kelompok umur
          </Text>
        </Box>

        <Box px={{ base: "md", md: 100 }}>
          <Paper p="xl" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconDatabaseOff size={80} color={colors.grey['2']} />
                <Text ta="center" fz="lg" fw={500} c="dimmed">
                  Data Belum Tersedia
                </Text>
                <Text ta="center" fz="sm" c="dimmed" maw={400}>
                  Data distribusi umur untuk tahun ini belum diperbarui.
                  Silakan hubungi administrator desa untuk informasi lebih lanjut.
                </Text>
              </Stack>
            </Center>
          </Paper>
        </Box>
      </Stack>
    )
  }

  // Sort data by age range (extract the first number from rentangUmur)
  const sortedData = [...data].sort((a, b) => {
    const extractMinAge = (range: string) => {
      const match = range.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 999;
    };
    return extractMinAge(a.rentangUmur) - extractMinAge(b.rentangUmur);
  });

  const chartData = sortedData.map(item => ({
    umur: item.rentangUmur,
    jumlah: item.jumlah,
  }));

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"lg"}>
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
        >
          Distribusi Umur
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          c="black"
        >
          Komposisi penduduk berdasarkan kelompok umur
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Paper p="xl" withBorder>
          <Text fw={700} fz="lg" mb="md" c="black">
            Statistik Distribusi Umur
          </Text>
          
          <BarChart
            h={400}
            data={chartData}
            dataKey="umur"
            series={[{ name: 'jumlah', color: colors['blue-button'] }]}
            tickLine="y"
            yAxisProps={{
              width: 80,
            }}
            xAxisProps={{
              angle: -45,
              textAnchor: 'end',
              height: 100,
              interval: 0,
              style: {
                fontSize: '12px',
              }
            }}
            gridAxis="y"
            withXAxis
            withYAxis
          />
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
