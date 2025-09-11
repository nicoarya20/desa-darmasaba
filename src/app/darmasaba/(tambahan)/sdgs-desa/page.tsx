'use client'
import { Box, Center, Container, Image, LoadingOverlay, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
import { Prisma } from '@prisma/client';
import { useEffect, useState } from 'react';
import { IconMoodSad } from '@tabler/icons-react';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';

function Page() {
  const [sdgsDesa, setSdgsDesa] = useState<Prisma.SDGSDesaGetPayload<{ include: { image: true } }>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSdgsDesa = async () => {
      try {
        const response = await fetch('/api/landingpage/sdgsdesa/findMany?limit=50&page=1');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        let data = [];
        if (Array.isArray(result.data)) {
          data = result.data;
        } else if (Array.isArray(result)) {
          data = result;
        } else {
          console.error('Format data tidak valid:', result);
        }
        setSdgsDesa(data);
      } catch (error) {
        console.error('Gagal mengambil data sdgs desa:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSdgsDesa();
  }, []);

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
          {!loading && sdgsDesa.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xl" verticalSpacing="xl">
              {sdgsDesa.map((item) => (
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
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Image
                      src={item.image?.link || '/placeholder-sdgs.png'}
                      alt={item.name}
                      width={120}
                      height={120}
                      fit="contain"
                      style={{ filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.1))' }}
                    />
                  </Box>
                  <Stack gap="xs" align="center" style={{ width: '100%' }}>
                    <Tooltip label={item.name} position="top" withArrow>
                      <Title order={4} ta="center" c="dark" fw={600} lineClamp={2} style={{ minHeight: '3rem' }}>
                        {item.name}
                      </Title>
                    </Tooltip>
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
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
