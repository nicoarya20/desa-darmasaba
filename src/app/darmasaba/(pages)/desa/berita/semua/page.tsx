/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import {
  Badge, Box, Button, Card, Center, Container, Divider,
  Flex, Grid, GridCol, Group, Image, Pagination,
  Paper, SimpleGrid, Skeleton, Stack, Text, Title
} from '@mantine/core';
import { IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function Semua() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();

  // Ambil parameter langsung dari URL
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Gunakan proxy untuk state global
  const state = useProxy(stateDashboardBerita.berita);
  const featured = useProxy(stateDashboardBerita.berita.findFirst);
  const loadingGrid = state.findMany.loading;
  const loadingFeatured = featured.loading;

  // Load berita utama sekali saja
  useEffect(() => {
    if (!featured.data && !loadingFeatured) {
      stateDashboardBerita.berita.findFirst.load();
    }
  }, [featured.data, loadingFeatured]);

  // Load berita terbaru tiap page / search berubah
  useEffect(() => {
    const limit = 3;
    state.findMany.load(page, limit, search);
  }, [page, search]);

  // Handler pagination → langsung update URL
  const handlePageChange = (newPage: number) => {
    const url = new URLSearchParams(searchParams.toString());
    if (search) url.set('search', search);
    if (newPage > 1) url.set('page', newPage.toString());
    else url.delete('page'); // biar page=1 ga muncul di URL

    router.replace(`?${url.toString()}`);
  };

  const featuredData = featured.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: "md", md: "xl" }}>
        {/* === Berita Utama === */}
        {loadingFeatured ? (
          <Center><Skeleton h={400} /></Center>
        ) : featuredData ? (
          <Box mb={50}>
            <Text fz="h2" fw={700} mb="md">Berita Utama</Text>
            <Paper shadow="md" radius="md" withBorder>
              <Grid gutter={0}>
                <GridCol span={{ base: 12, md: 6 }}>
                  <Image
                    src={featuredData.image?.link || '/images/placeholder.jpg'}
                    alt={featuredData.judul || 'Berita Utama'}
                    height={400}
                    fit="cover"
                    radius="md"
                    style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0 }}
                    loading="lazy"
                  />
                </GridCol>
                <GridCol span={{ base: 12, md: 6 }} p="xl">
                  <Stack h="100%" justify="space-between">
                    <div>
                      <Badge color="blue" variant="light" mb="md">
                        {featuredData.kategoriBerita?.name || 'Berita'}
                      </Badge>
                      <Title order={2} mb="md">{featuredData.judul}</Title>
                      <Text color="dimmed" lineClamp={3} mb="md">
                        {featuredData.deskripsi}
                      </Text>
                    </div>
                    <Group justify="apart" mt="auto">
                      <Group gap="xs">
                        <IconCalendar size={18} />
                        <Text size="sm">
                          {new Date(featuredData.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                      </Group>
                      <Button
                        variant="light"
                        rightSection={<IconArrowRight size={16} />}
                        onClick={() =>
                          router.push(`/darmasaba/desa/berita/${featuredData.kategoriBerita?.name}/${featuredData.id}`)
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
        ) : null}

        {/* === Berita Terbaru === */}
        <Box mt={50}>
          <Title order={2} mb="md">Berita Terbaru</Title>
          <Divider mb="xl" />

          {loadingGrid ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} h={300} radius="md" />
              ))}
            </SimpleGrid>
          ) : paginatedNews.length === 0 ? (
            <Text c="dimmed" ta="center">Tidak ada berita ditemukan.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
              {paginatedNews.map((item) => (
                <Card key={item.id} shadow="sm" p="lg" radius="md" withBorder>
                  <Card.Section>
                    <Image
                      src={item.image?.link || '/images/placeholder-small.jpg'}
                      height={200}
                      alt={item.judul}
                      fit="cover"
                      loading="lazy"
                    />
                  </Card.Section>

                  <Badge color="blue" variant="light" mt="md">
                    {item.kategoriBerita?.name || 'Berita'}
                  </Badge>

                  <Text fw={600} size="lg" mt="sm" lineClamp={2}>{item.judul}</Text>
                  <Text size="sm" color="dimmed" lineClamp={3} mt="xs">{item.deskripsi}</Text>

                  <Flex align="center" justify="apart" mt="md" gap="xs">
                    <Text size="xs" color="dimmed">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                    <Button
                      p="xs"
                      variant="light"
                      rightSection={<IconArrowRight size={16} />}
                      onClick={() =>
                        router.push(`/darmasaba/desa/berita/${item.kategoriBerita?.name}/${item.id}`)
                      }
                    >
                      Baca Selengkapnya
                    </Button>
                  </Flex>
                </Card>
              ))}
            </SimpleGrid>
          )}

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
    </Box>
  );
}

export default Semua;
