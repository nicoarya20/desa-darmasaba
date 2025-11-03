/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Flex, Group, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../layanan/_com/BackButto';

function Page() {
  const router = useTransitionRouter()
  const [loading, setLoading] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const state = useProxy(potensiDesaState)

  useEffect(() => {
    state.kategoriPotensi.findMany.load()
    const loadData = async () => {
      try {
        setLoading(true)
        await state.potensiDesa.findMany.load()
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.potensiDesa.findMany.data

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={48}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap="lg">
          <Stack gap="sm" maw={600}>
            <Text fz={{ base: "2rem", md: "3rem" }} fw={900} c={colors["blue-button"]} lh={1.2}>
              Potensi Desa Darmasaba
            </Text>
            <Text fz="lg" ta="justify">
              Temukan berbagai potensi unggulan, peluang, dan daya tarik yang menjadikan Desa Darmasaba istimewa.
            </Text>
          </Stack>
          <Paper
            radius="2xl"
            px="xl"
            py="md"
            bg={colors["blue-button"]}
            shadow="xl"
            withBorder
          >
            <Flex justify="center" align="center" gap="xl">
              <Box>
                <Text ta="center" fz="2rem" fw={800} c="white">
                  {data?.filter(item => item.kategori?.nama.toLowerCase() !== 'wisata').length || 0}
                </Text>
                <Text ta="center" fz="sm" c="white" fw={500}>
                  Potensi
                </Text>
              </Box>
              <Box>
                <Text ta="center" fz="2rem" fw={800} c="white">
                  {data?.filter(item => item.kategori?.nama.toLowerCase() === 'wisata').length || 0}
                </Text>
                <Text ta="center" fz="sm" c="white" fw={500}>
                  Wisata
                </Text>
              </Box>
            </Flex>
          </Paper>
        </Flex>

        <SimpleGrid py={48} cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} h={360} radius="xl" />
            ))
          ) : data && data.length > 0 ? (
            data.map((v, k) => (
              <BackgroundImage
                key={k}
                src={v.image?.link || ''}
                h={360}
                radius="xl"
                onMouseEnter={() => setHoveredId(v.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ 
                  overflow: 'hidden', 
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* Overlay with smooth transition */}
                <Box
                  pos="absolute"
                  inset={0}
                  bg={hoveredId === v.id 
                    ? "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.75) 100%)" 
                    : "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 100%)"
                  }
                  style={{
                    transition: 'background 0.3s ease'
                  }}
                />
                
                <Stack justify="space-between" h="100%" gap="md" p="lg" pos="relative">
                  {/* Kategori badge - always visible */}
                  <Group>
                    <Paper 
                      radius="lg" 
                      py={6} 
                      px={12} 
                      shadow="md" 
                      withBorder 
                      bg="rgba(255,255,255,0.9)"
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Text fz="sm" fw={600}>{v.kategori?.nama}</Text>
                    </Paper>
                  </Group>

                  {/* Nama potensi - visible on hover */}
                  <Box
                    style={{
                      opacity: hoveredId === v.id ? 1 : 0,
                      transform: hoveredId === v.id ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'all 0.3s ease',
                      pointerEvents: hoveredId === v.id ? 'auto' : 'none'
                    }}
                  >
                    <Text
                      fw={800}
                      c="white"
                      fz="xl"
                      ta="center"
                      lineClamp={2}
                      lh={1.3}
                    >
                      {v.name}
                    </Text>
                  </Box>

                  {/* Button - visible on hover */}
                  <Group 
                    justify="center"
                    style={{
                      opacity: hoveredId === v.id ? 1 : 0,
                      transform: hoveredId === v.id ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'all 0.3s ease',
                      pointerEvents: hoveredId === v.id ? 'auto' : 'none'
                    }}
                  >
                    <Button
                      radius="xl"
                      size="md"
                      leftSection={<IconEye size={18} />}
                      bg={colors["blue-button"]}
                      variant="gradient"
                      gradient={{ from: colors["blue-button"], to: "#4dabf7", deg: 45 }}
                      onClick={() => router.push(`/darmasaba/desa/potensi/${v.id}`)}
                    >
                      Lihat Detail
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            ))
          ) : (
            <Center h={240}>
              <Stack align="center" gap="xs">
                <Text fz="lg" fw={600} c="dimmed">
                  Belum ada potensi desa
                </Text>
                <Text fz="sm" c="dimmed">
                  Data potensi akan tampil di sini setelah tersedia.
                </Text>
              </Stack>
            </Center>
          )}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;