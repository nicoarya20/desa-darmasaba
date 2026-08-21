/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import sdgsDesa from '@/app/admin/(dashboard)/_state/landing-page/sdgs-desa';
import colors from '@/con/colors';
import { BarChart } from '@mantine/charts';
import { Box, Center, Container, Image, LoadingOverlay, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconMoodSad } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';

function Page() {
  type SdgsDesa = {
    id: string
    name: string
    jumlah: number
  };
  const [chartData, setChartData] = useState<SdgsDesa[]>([])
  const [mounted, setMounted] = useState(false);
  const state = useProxy(sdgsDesa.findManyAll)
  const [loading, setLoading] = useState(true);

  // Definisikan urutan goal SDGs Desa (sesuai nomor 1-18)
  const sdgsOrder = [
    "Desa Tanpa Kemiskinan",
    "Desa Tanpa Kelaparan",
    "Desa Sehat dan Sejahtera",
    "Pendidikan Desa Berkualitas",
    "Keterlibatan Perempuan Desa",
    "Desa Layak Air Bersih dan Sanitasi",
    "Desa Berenergi Bersih dan Terbarukan",
    "Pertumbuhan Ekonomi Desa Merata",
    "Infrastruktur dan Inovasi Desa Sesuai Kebutuhan",
    "Desa Tanpa Kesenjangan",
    "Kawasan Permukiman Desa Aman dan Nyaman",
    "Konsumsi dan Produksi Desa Sadar Lingkungan",
    "Desa Tanggap Perubahan Iklim",
    "Desa Peduli Lingkungan Laut",
    "Desa Peduli Lingkungan Darat",
    "Desa Damai Berkeadilan",
    "Kemitraan untuk Pembangunan Desa",
    "Kelembagaan Desa Dinamis dan Budaya Desa Adaptif"
  ];


  useEffect(() => {
    if (state.data) {
      // Urutkan data sesuai urutan goal 1-18
      const sortedData = [...state.data].sort((a, b) => {
        const indexA = sdgsOrder.indexOf(a.name);
        const indexB = sdgsOrder.indexOf(b.name);
        return indexA - indexB;
      });

      setChartData(sortedData.map((item: any) => ({
        id: item.id,
        name: item.name,
        jumlah: item.jumlah,
      })));
    }
  }, [state.data]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setMounted(true);
        setLoading(true)
        await state.load()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const averageScore = useMemo(() => {
    if (!state.data?.length) return 0;
    const total = state.data.reduce((sum: number, item: any) => {
      const val = typeof item.jumlah === 'string'
        ? parseFloat(item.jumlah.replace(',', '.'))
        : Number(item.jumlah);
      return isNaN(val) ? sum : sum + val;
    }, 0);
    return parseFloat((total / state.data.length).toFixed(2));
  }, [state.data]);

  return (
    <Stack pos="relative" py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Container w={{ base: '100%', md: '60%' }}>
        <Stack align="center" gap="sm">
          <Title order={1} fz={{ base: '2.4rem', md: '3.4rem' }} fw={800} ta="center" style={{ letterSpacing: '-0.02em' }}>
            SDGs Desa
          </Title>
          <Text ta="center" c="dimmed" fz="lg">
            Pembangunan berkelanjutan yang inklusif, adil, dan berdaya saing di tingkat desa
          </Text>
        </Stack>
      </Container>

      <Box px={{ base: 'md', md: 100 }}>
        <Text py={10} ta="justify" fz="md" lh={1.7}>
          SDGs Desa adalah upaya terpadu pemerintah dalam percepatan pencapaian tujuan pembangunan berkelanjutan di tingkat desa.
          Ini merupakan adaptasi dari SDGs global dalam konteks pembangunan desa di Indonesia, yang bertujuan menciptakan desa
          inklusif, berkelanjutan, dan tangguh menghadapi tantangan masa depan.
        </Text>
        <Text ta="justify" pb={20} fz="md" lh={1.7}>
          Berdasarkan Permendesa Nomor 21 Tahun 2020, SDGs Desa mencakup 18 tujuan yang harus dicapai pada tahun 2030.
          Tujuan-tujuan tersebut meliputi pengentasan kemiskinan, peningkatan kesehatan dan pendidikan, kesetaraan gender,
          pertumbuhan ekonomi, pembangunan infrastruktur, hingga pelestarian lingkungan.
        </Text>
      </Box>

      <Box py={20} px={{ base: 'md', md: 100 }}>
        <Box pos="relative" style={{ minHeight: 200 }}>
          <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

          {!loading && state.data && state.data.length > 0 && (
            <Center mb="xl">
              <Box ta="center">
                <Title order={2} c={colors['blue-button']}>Rata-Rata SDGs Desa : </Title>
                <Text fw={700} c={colors['blue-button']} fz="2rem" style={{ minHeight: '4rem' }}>
                  {averageScore} %
                </Text>
                <Text fs={"italic"} ta="center" fz="lg">
                  Diambil dari rata-rata 18 Goals SDGs Desa dari Desa Darmasaba
                </Text>
              </Box>
            </Center>
          )}

          {!loading && state.data && state.data.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl" verticalSpacing="xl">
              {state.data?.map((item) => (
                <Paper
                  key={item.id}
                  p="lg"
                  radius="xl"
                  shadow="md"
                  withBorder
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)');
                    (e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)');
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget.style.transform = 'translateY(0) scale(1)');
                    (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)');
                  }}
                >
                  <Box
                    p="md"
                    style={{
                      background: 'linear-gradient(145deg, #f8f9fa, #ffffff)',
                      borderRadius: '12px',
                      width: '100%',
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Image
                      src={item.image?.link || '/placeholder-sdgs.png'}
                      fallbackSrc="/placeholder-sdgs.png"
                      alt={item.name}
                      w={120}
                      h={120}
                      fit="contain"
                      style={{ filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.1))' }}
                      loading="lazy"
                    />
                  </Box>
                  <Stack gap="xs" align="center" style={{ width: '100%' }}>
                    <Title order={4} ta="center" c="dark" fw={600} lineClamp={2} style={{ minHeight: '3rem' }}>
                      {item.name}
                    </Title>
                    <Text
                      ta="center"
                      fw={700}
                      c={colors['blue-button']}
                      fz="2rem"
                      lineClamp={2}
                      style={{ minHeight: '4rem' }}
                    >
                      {item.jumlah}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          ) : !loading ? (
            <Center style={{ minHeight: 200, flexDirection: 'column', gap: '0.5rem' }}>
              <IconMoodSad size={42} stroke={1.5} color="var(--mantine-color-dimmed)" />
              <Text c="dimmed" fz="lg" fw={500}>
                Belum ada data SDGs Desa
              </Text>
            </Center>
          ) : null}

          {/* Chart */}
          <Box mt={30} style={{ width: '100%' }}>
            <Paper
              bg={colors['white-1']}
              py={90}
              px={{ base: 12, sm: 24, md: 50 }}
              radius="md"
              withBorder
            >
              <Stack gap="lg">
                <Title ta="center" order={2}>Grafik SDGs Desa</Title>

                {mounted && chartData.length > 0 ? (
                  <Box
                    style={{
                      width: "100%",
                      overflowX: "auto",
                      paddingBottom: 250,
                    }}
                  >
                    <Box style={{ minWidth: 900 }}> {/* ⭐ batas minimum biar bisa scroll */}
                      <BarChart
                        h={350}
                        data={chartData}
                        dataKey="name"
                        type="stacked"
                        withBarValueLabel
                        series={[
                          {
                            name: 'jumlah',
                            color: colors['blue-button'],
                          },
                        ]}
                        withTooltip
                        tooltipProps={{
                          labelFormatter: (value) => value,
                          formatter: (value) => `${value}%`,
                        }}
                        xAxisProps={{
                          angle: -45,
                          textAnchor: 'end',
                          interval: 0,
                          fontSize: 11,
                          dy: 10,
                        }}
                        yAxisProps={{
                          domain: [0, 100],
                          tickCount: 6,
                        }}
                        withLegend={false}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Text c="dimmed">Belum ada data untuk ditampilkan dalam grafik</Text>
                )}
              </Stack>
            </Paper>
          </Box>

        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
