'use client'
import { Box, Center, Container, Image, LoadingOverlay, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Prisma } from '@prisma/client';
import { useEffect, useState } from 'react';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';

function Page() {
  const [sdgsDesa, setSdgsDesa] = useState<Prisma.SDGSDesaGetPayload<{ include: { image: true } }>[]>([]);
  const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchSdgsDesa = async () => {
            try {
                const response = await fetch('/api/landingpage/sdgsdesa/findMany');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                // Ensure the data is an array before setting it
                let data = [];
                if (Array.isArray(result.data)) {
                    data = result.data;
                } else if (Array.isArray(result)) {
                    // In case the API returns the array directly
                    data = result;
                } else {
                    console.error('Invalid data format:', result);
                }
                setSdgsDesa(data);
            } catch (error) {
                console.error('Error fetching sdgs desa:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSdgsDesa();
    }, []);

    return (
    <Stack pos={"relative"} py={"xl"} gap={22}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            SDGs Desa
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text
          py={10}
          ta={"justify"}
        >
          SDGs Desa adalah upaya terpadu pemerintah dalam percepatan pencapaian tujuan pembangunan berkelanjutan di tingkat desa. Ini merupakan terjemahan dari SDGs global dalam konteks pembangunan desa di Indonesia. SDGs Desa bertujuan untuk menciptakan desa yang lebih inklusif, berkelanjutan, dan tangguh menghadapi tantangan masa depan. Adapun
        </Text>
        <Text
          ta={"justify"}
          pb={20}
        >
          SDGs Desa sebagaimana dijabarkan dalam Permendesa Nomor 21 tahun 2020 terdiri dari 18 tujuan yang harus dicapai pada tahun 2030. Tujuan-tujuan tersebut mencakup berbagai aspek kehidupan masyarakat desa, mulai dari pengentasan kemiskinan, peningkatan kesehatan dan pendidikan, kesetaraan gender, pertumbuhan ekonomi, infrastruktur, hingga kelestarian lingkungan. Adapun SDGs Desa terdiri dari tujuan-tujuan sebagai berikut:
        </Text>
      </Box >
      <Box py={20} px={{ base: "md", md: 100 }}>
        <Box pos="relative" style={{ minHeight: 200 }}>
          <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
          {!loading && sdgsDesa.length > 0 ? (
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing="xl"
              verticalSpacing="xl"
            >
              {sdgsDesa.map((item) => (
                <Paper
                  key={item.id}
                  p="md"
                  radius="md"
                  shadow="sm"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box
                    p="md"
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
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
                    />
                  </Box>
                  <Stack gap="xs" style={{ width: '100%' }}>
                    <Title order={4} ta="center" c={"dimmed"} fw={600} lineClamp={2} style={{ minHeight: '3rem' }}>
                      {item.name}
                    </Title>
                    <Text ta="center" fw={"bold"} c={colors['blue-button']} fz={"h2"} lineClamp={3} style={{ minHeight: '4.5rem' }}>
                      {item.jumlah}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          ) : !loading ? (
            <Center style={{ minHeight: 200 }}>
              <Text>Tidak ada data SDGs Desa yang tersedia</Text>
            </Center>
          ) : null}
        </Box>
      </Box>
    </Stack >
  );
}

export default Page;
