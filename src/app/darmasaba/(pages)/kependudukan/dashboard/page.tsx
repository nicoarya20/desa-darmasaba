'use client'
import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Title, SimpleGrid, Skeleton, Group, Badge, Center } from '@mantine/core';
import { IconUsers, IconHome, IconBasket, IconCoin, IconDatabaseOff } from '@tabler/icons-react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import kependudukanDashboard from '@/app/admin/(dashboard)/_state/kependudukan/dashboard';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const state = useProxy(kependudukanDashboard)

  useShallowEffect(() => {
    state.summary.load()
  }, [])

  const summary = state.summary.data?.summary;

  if (state.summary.loading) {
    return (
      <Stack py={10}>
        <Skeleton h={200} />
      </Stack>
    )
  }

  if (!summary) {
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
            Dashboard Kependudukan
          </Title>
          <Text
            ta="center"
            fz={{ base: 'sm', md: 'md' }}
            lh={1.5}
            c="black"
          >
            Ringkasan data kependudukan Desa Darmasaba
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
                  Data kependudukan untuk tahun ini belum diperbarui. 
                  Silakan hubungi administrator desa untuk informasi lebih lanjut.
                </Text>
              </Stack>
            </Center>
          </Paper>
        </Box>
      </Stack>
    )
  }

  const stats = [
    {
      title: 'Total Penduduk',
      value: summary.totalPenduduk,
      icon: IconUsers,
      color: colors['blue-button'],
    },
    {
      title: 'Kepala Keluarga',
      value: summary.totalKK,
      icon: IconHome,
      color: '#6EDF9C',
    },
    {
      title: 'Kelahiran Tahun Ini',
      value: summary.totalKelahiran,
      icon: IconBasket,
      color: '#FF9F43',
    },
    {
      title: 'Penduduk Miskin',
      value: summary.totalKemiskinan,
      icon: IconCoin,
      color: '#EE5050',
    },
  ];

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
          Dashboard Kependudukan
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          c="black"
        >
          Ringkasan data kependudukan Desa Darmasaba
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Paper key={stat.title} p="xl" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" fz="sm" fw={500}>
                      {stat.title}
                    </Text>
                    <Text fz={28} fw={700} mt={5}>
                      {stat.value.toLocaleString('id-ID')}
                    </Text>
                  </div>
                  <Badge
                    size="xl"
                    color={stat.color}
                    variant="light"
                  >
                    <Icon size={32} />
                  </Badge>
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Box>

      {state.summary.data?.dinamika && (
        <Box px={{ base: "md", md: 100 }}>
          <Paper p="xl" withBorder>
            <Title order={3} mb="md" c={colors["blue-button"]}>
              Dinamika Penduduk
            </Title>
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Paper p="md" bg="#6EDF9C">
                <Text fz="sm" c="white">Kelahiran</Text>
                <Text fz={24} fw={700} c="white">
                  {state.summary.data.dinamika.kelahiran}
                </Text>
              </Paper>
              <Paper p="md" bg="#EE5050">
                <Text fz="sm" c="white">Kematian</Text>
                <Text fz={24} fw={700} c="white">
                  {state.summary.data.dinamika.kematian}
                </Text>
              </Paper>
              <Paper p="md" bg="#5082EE">
                <Text fz="sm" c="white">Pindah Masuk</Text>
                <Text fz={24} fw={700} c="white">
                  {state.summary.data.dinamika.pindahMasuk}
                </Text>
              </Paper>
              <Paper p="md" bg="#FF9F43">
                <Text fz="sm" c="white">Pindah Keluar</Text>
                <Text fz={24} fw={700} c="white">
                  {state.summary.data.dinamika.pindahKeluar}
                </Text>
              </Paper>
            </SimpleGrid>
          </Paper>
        </Box>
      )}
    </Stack>
  );
}

export default Page;
