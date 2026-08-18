'use client'
import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Title, Skeleton, Flex, ColorSwatch, Center } from '@mantine/core';
import { IconDatabaseOff } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import distribusiAgama from '@/app/admin/(dashboard)/_state/kependudukan/distribusi-agama';
import { useShallowEffect } from '@mantine/hooks';
import { PieChart } from '@mantine/charts';

function Page() {
  const state = useProxy(distribusiAgama)

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  interface DistribusiAgamaItem {
    id: string;
    agama: string;
    jumlah: number;
    tahun: number;
  }

  const data = (state.findMany.data as DistribusiAgamaItem[]) || [];

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
            Distribusi Agama
          </Title>
          <Text
            ta="center"
            fz={{ base: 'sm', md: 'md' }}
            lh={1.5}
            c="black"
          >
            Komposisi agama penduduk Desa Darmasaba
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
                  Data distribusi agama untuk tahun ini belum diperbarui. 
                  Silakan hubungi administrator desa untuk informasi lebih lanjut.
                </Text>
              </Stack>
            </Center>
          </Paper>
        </Box>
      </Stack>
    )
  }

  const chartData = data.map(item => ({
    name: item.agama,
    value: item.jumlah,
    color: getColorForAgama(item.agama),
  }));

  const total = data.reduce((sum, item) => sum + item.jumlah, 0);

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
          Distribusi Agama
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          c="black"
        >
          Komposisi agama penduduk Desa Darmasaba
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Paper p="xl" withBorder>
          <Text fw={700} fz="lg" mb="md" c="black">
            Statistik Distribusi Agama
          </Text>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap="xl" align="center">
            <Box style={{ flex: 1 }}>
              <PieChart
                data={chartData}
                size={300}
              />
            </Box>
            
            <Stack style={{ flex: 1 }} gap="md">
              {data.map((item) => (
                <Flex key={item.id} align="center" gap="sm">
                  <ColorSwatch color={getColorForAgama(item.agama)} size={20} />
                  <Text fz="sm" c="black" style={{ flex: 1 }}>
                    {item.agama}
                  </Text>
                  <Text fz="sm" fw={700} c="black">
                    {item.jumlah.toLocaleString('id-ID')}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    ({((item.jumlah / total) * 100).toFixed(1)}%)
                  </Text>
                </Flex>
              ))}
              <Box mt="md" pt="md" style={{ borderTop: `1px solid ${colors.grey['2']}` }}>
                <Flex justify="space-between" align="center">
                  <Text fw={700} c="black">Total</Text>
                  <Text fw={700} c="black">{total.toLocaleString('id-ID')}</Text>
                </Flex>
              </Box>
            </Stack>
          </Flex>
        </Paper>
      </Box>
    </Stack>
  );
}

function getColorForAgama(agama: string): string {
  const colors: Record<string, string> = {
    'HINDU': '#FF9F43',
    'ISLAM': '#6EDF9C',
    'KRISTEN': '#5082EE',
    'KRISTEN_PROTESTAN': '#5082EE',
    'KRISTEN_KATOLIK': '#4263D1',
    'BUDDHA': '#FFD43B',
    'KONGHUCU': '#EE5050',
    'LAINNYA': '#868E96',
  };
  return colors[agama] || '#868E96';
}

export default Page;
