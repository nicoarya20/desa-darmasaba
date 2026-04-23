'use client'
import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Title, Skeleton, SimpleGrid, Center } from '@mantine/core';
import { IconDatabaseOff } from '@tabler/icons-react';
import React from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import kependudukanDashboard from '@/app/admin/(dashboard)/_state/kependudukan/dashboard';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const stateKependudukan = useProxy(kependudukanDashboard);
  const statePersentaseKelahiranKematian = useProxy(persentaseKelahiranKematian);

  // Load migration data from kependudukan dashboard
  useShallowEffect(() => {
    stateKependudukan.summary.load();
  }, []);

  // Load birth and death data
  useShallowEffect(() => {
    statePersentaseKelahiranKematian.kelahiran.findMany.load();
    statePersentaseKelahiranKematian.kematian.findMany.load();
  }, []);

  const dinamika = stateKependudukan.summary.data?.dinamika;
  
  // Calculate birth and death counts from detailed data
  const kelahiranCount = statePersentaseKelahiranKematian.kelahiran.findMany.data?.length || 0;
  const kematianCount = statePersentaseKelahiranKematian.kematian.findMany.data?.length || 0;

  const isLoading = stateKependudukan.summary.loading || 
                    statePersentaseKelahiranKematian.kelahiran.findMany.loading ||
                    statePersentaseKelahiranKematian.kematian.findMany.loading;

  if (isLoading) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  if (!dinamika || (kelahiranCount === 0 && kematianCount === 0 && (!dinamika.pindahMasuk || dinamika.pindahMasuk === 0))) {
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
            Dinamika Penduduk
          </Title>
          <Text
            ta="center"
            fz={{ base: 'sm', md: 'md' }}
            lh={1.5}
            c="black"
          >
            Statistik kelahiran, kematian, dan migrasi penduduk
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
                  Data dinamika penduduk untuk tahun ini belum diperbarui. 
                  Silakan hubungi administrator desa untuk informasi lebih lanjut.
                </Text>
              </Stack>
            </Center>
          </Paper>
        </Box>
      </Stack>
    )
  }

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
          Dinamika Penduduk
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          c="black"
        >
          Statistik kelahiran, kematian, dan migrasi penduduk
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Paper p="xl" withBorder>
          <Title order={3} mb="md" c={colors["blue-button"]}>
            Statistik Dinamika Penduduk
          </Title>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            <Paper p="lg" bg="#6EDF9C">
              <Text fz="sm" c="white" fw={500}>
                Kelahiran
              </Text>
              <Text fz={36} fw={700} c="white" mt={10}>
                {kelahiranCount}
              </Text>
            </Paper>

            <Paper p="lg" bg="#EE5050">
              <Text fz="sm" c="white" fw={500}>
                Kematian
              </Text>
              <Text fz={36} fw={700} c="white" mt={10}>
                {kematianCount}
              </Text>
            </Paper>

            <Paper p="lg" bg="#5082EE">
              <Text fz="sm" c="white" fw={500}>
                Pindah Masuk
              </Text>
              <Text fz={36} fw={700} c="white" mt={10}>
                {dinamika?.pindahMasuk || 0}
              </Text>
            </Paper>

            <Paper p="lg" bg="#FF9F43">
              <Text fz="sm" c="white" fw={500}>
                Pindah Keluar
              </Text>
              <Text fz={36} fw={700} c="white" mt={10}>
                {dinamika?.pindahKeluar || 0}
              </Text>
            </Paper>
          </SimpleGrid>

          <Box mt="xl" pt="xl" style={{ borderTop: `1px solid ${colors.grey['2']}` }}>
            <Text fz="md" c="dimmed" fw={500} mb="md">
              Ringkasan:
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Paper p="md" bg={colors.grey[1]}>
                <Text fz="sm" c="dimmed">Pertumbuhan Alami</Text>
                <Text fz={24} fw={700} c={kelahiranCount - kematianCount >= 0 ? '#6EDF9C' : '#EE5050'}>
                  {kelahiranCount - kematianCount > 0 ? '+' : ''}{kelahiranCount - kematianCount}
                </Text>
                <Text fz="xs" c="dimmed">(Kelahiran - Kematian)</Text>
              </Paper>

              <Paper p="md" bg={colors.grey[1]}>
                <Text fz="sm" c="dimmed">Migrasi Bersih</Text>
                <Text fz={24} fw={700} c={(dinamika?.pindahMasuk || 0) - (dinamika?.pindahKeluar || 0) >= 0 ? colors['blue-button'] : '#FF9F43'}>
                  {(dinamika?.pindahMasuk || 0) - (dinamika?.pindahKeluar || 0) > 0 ? '+' : ''}{(dinamika?.pindahMasuk || 0) - (dinamika?.pindahKeluar || 0)}
                </Text>
                <Text fz="xs" c="dimmed">(Pindah Masuk - Pindah Keluar)</Text>
              </Paper>
            </SimpleGrid>
          </Box>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
