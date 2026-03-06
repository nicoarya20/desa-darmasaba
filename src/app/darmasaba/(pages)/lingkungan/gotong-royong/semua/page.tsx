/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  Transition
} from '@mantine/core';
import { IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const state = useProxy(gotongRoyongState.kegiatanDesa);
  const featured = useProxy(gotongRoyongState.kegiatanDesa.findFirst);
  const loadingGrid = state.findMany.loading;
  const loadingFeatured = featured.loading;

  // Load featured data once on component mount
  useEffect(() => {
    let mounted = true;

    const loadFeatured = async () => {
      try {
        if (!featured.data && !loadingFeatured) {
          await gotongRoyongState.kegiatanDesa.findFirst.load();
        }
      } catch (error) {
        console.error('Error loading featured data:', error);
      }
    };

    if (mounted) {
      loadFeatured();
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const limit = 3;
        await state.findMany.load(page, limit, search);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (mounted) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [page, search]);

  const handlePageChange = (newPage: number) => {
    const url = new URLSearchParams(searchParams.toString());
    if (search) url.set('search', search);
    if (newPage > 1) url.set('page', newPage.toString());
    else url.delete('page');

    // Use push instead of replace to keep browser history
    router.push(`?${url.toString()}`, { scroll: false });
  };

  const featuredData = featured.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  // Animasi transisi halus tapi tetap instant load
  const MotionBox = motion(Box as any);

  // fallback kosong
  if (!loadingGrid && !loadingFeatured && paginatedNews.length === 0) {
    return (
      <Container size="xl" py={80} ta="center">
        <Title order={2} mb="md">Belum Ada Data Gotong Royong</Title>
        <Text c="dimmed">Tidak ada data gotong royong yang tersedia saat ini.</Text>
      </Container>
    );
  }

  return (
    <MotionBox
      key={`${page}-${search}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      py={20}
    >
      <Container size="xl" px={{ base: 'md', md: 'xl' }}>
        {/* === Gotong Royong Utama === */}
        <Transition mounted={!loadingFeatured} transition="fade" duration={200} timingFunction="ease-out">
          {(styles) =>
            featuredData ? (
              <Box mb={50} style={styles}>
                <Text fz="h2" fw={700} mb="md">Gotong royong Utama</Text>
                <Paper shadow="md" radius="md" withBorder>
                  <Grid gutter={0}>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Image
                        src={featuredData.image?.link || '/images/placeholder.jpg'}
                        alt={featuredData.judul || 'Gotong royong Utama'}
                        height={400}
                        fit="cover"
                        radius="md"
                        loading="lazy"
                      />
                    </GridCol>
                    <GridCol span={{ base: 12, md: 6 }} p="xl">
                      <Stack h="100%" justify="space-between">
                        <div>
                          <Badge color="blue" variant="light" mb="md">
                            {featuredData.kategoriKegiatan?.nama || 'Gotong royong'}
                          </Badge>
                          <Title order={2} mb="md">{featuredData.judul}</Title>
                          <Text
                            c="dimmed"
                            lineClamp={3}
                            mb="md"
                            dangerouslySetInnerHTML={{ __html: featuredData.deskripsiSingkat }}
                          />
                        </div>
                        <Group justify="apart" mt="auto">
                          <Group gap="xs">
                            <IconCalendar size={18} />
                            <Text size="sm">
                              {new Date(featuredData.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </Text>
                          </Group>
                          <Button
                            variant="light"
                            rightSection={<IconArrowRight size={16} />}
                            onClick={() =>
                              router.push(
                                `/darmasaba/lingkungan/gotong-royong/${featuredData.kategoriKegiatan?.nama}/${featuredData.id}`
                              )
                            }
                          >
                            Baca Selengkapnya
                          </Button>
                        </Group>
                      </Stack>
                    </GridCol>
                  </Grid>
                </Paper>
              </Box>
            ) : (
              <Skeleton h={400} radius="md" mb="xl" />
            )
          }
        </Transition>

        {/* === Gotong royong Terbaru === */}
        <Box mt={50}>
          <Title order={2} mb="md">Gotong royong Terbaru</Title>
          <Divider mb="xl" />

          <Transition mounted={!loadingGrid} transition="fade" duration={200} timingFunction="ease-out">
            {(styles) =>
              loadingGrid ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} h={300} radius="md" />
                    ))}
                </SimpleGrid>
              ) : paginatedNews.length === 0 ? (
                <Text c="dimmed" ta="center">
                  Tidak ada gotong royong ditemukan.
                </Text>
              ) : (
                <Box style={styles}>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
                    {paginatedNews.map((item) => (
                      <Card key={item.id} shadow="sm" p="lg" radius="md" withBorder>
                        <Card.Section>
                          <Box h={160} w="100%" style={{ overflow: 'hidden' }}>
                            <Image
                              src={item.image?.link || '/images/placeholder-small.jpg'}
                              alt={item.judul}
                              fit="cover"
                              loading="lazy"
                              radius={"md"}
                            />
                          </Box>
                        </Card.Section>

                        <Badge color="blue" variant="light" mt="md">
                          {item.kategoriKegiatan?.nama || 'Gotong royong'}
                        </Badge>

                        <Text fw={600} size="lg" mt="sm" lineClamp={2}>
                          {item.judul}
                        </Text>

                        <Text
                          size="sm"
                          c="dimmed"
                          lineClamp={3}
                          mt="xs"
                          dangerouslySetInnerHTML={{ __html: item.deskripsiSingkat }}
                        />

                        <Group justify="apart" mt="auto">
                          <Group gap="xs">
                            <IconCalendar size={18} />
                            <Text size="xs" c="dimmed">
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Text>
                          </Group>

                          <Button
                            p="xs"
                            variant="light"
                            rightSection={<IconArrowRight size={16} />}
                            onClick={() =>
                              router.push(
                                `/darmasaba/lingkungan/gotong-royong/${item.kategoriKegiatan?.nama}/${item.id}`
                              )
                            }
                          >
                            Baca Selengkapnya
                          </Button>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              )
            }
          </Transition>

          {/* Pagination */}
          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={page}
              onChange={handlePageChange}
              siblings={1}
              boundaries={1}
              withEdges
            />
          </Center>
        </Box>
      </Container>
    </MotionBox>
  );
}
