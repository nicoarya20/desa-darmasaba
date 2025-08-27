/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import { Badge, Box, Button, Card, Center, Container, Divider, Flex, Grid, GridCol, Group, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

function Page() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();

  // Parameter URL
  const search = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [page, setPage] = useState(currentPage);

  // Gunakan proxy untuk state
  const state = useProxy(gotongRoyongState.kegiatanDesa);
  const featured = useProxy(gotongRoyongState.kegiatanDesa.findFirst); // ✅ Berita utama
  const loadingGrid = state.findMany.loading;
  const loadingFeatured = featured.loading;

  // Load berita utama (hanya sekali)
  useEffect(() => {
    if (!featured.data && !loadingFeatured) {
      gotongRoyongState.kegiatanDesa.findFirst.load();
    }
  }, [featured.data, loadingFeatured]);

  // Load berita terbaru (untuk grid) saat page/search berubah
  useEffect(() => {
    const limit = 3; // Sesuaikan dengan tampilan grid
    state.findMany.load(page, limit, search);
  }, [page, search]);

  // Update URL saat page berubah
  useEffect(() => {
    const url = new URLSearchParams();
    if (search) url.set('search', search);
    if (page > 1) url.set('page', page.toString());
    router.replace(`?${url.toString()}`);
  }, [page, search]);

  const featuredData = featured.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: "md", md: "xl" }}>
        {/* === Gotong royong Utama (Tetap) === */}
        {loadingFeatured ? (
          <Center><Skeleton h={400} /></Center>
        ) : featuredData ? (
          <Box mb={50}>
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
                    style={{ borderBottomRightRadius: 0, borderTopRightRadius: 0 }}
                  />
                </GridCol>
                <GridCol span={{ base: 12, md: 6 }} p="xl">
                  <Stack h="100%" justify="space-between">
                    <div>
                      <Badge color="blue" variant="light" mb="md">
                        {featuredData.kategoriKegiatan?.nama || 'Gotong royong'}
                      </Badge>
                      <Title order={2} mb="md">{featuredData.judul}</Title>
                      <Text c="dimmed" lineClamp={3} mb="md">
                        {featuredData.deskripsiSingkat}
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
                        onClick={() => router.push(`/darmasaba/lingkungan/gotong-royong/${featuredData.kategoriKegiatan?.nama}/${featuredData.id}`)}
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

        {/* === Gotong royong Terbaru (Berubah Saat Pagination) === */}
        <Box mt={50}>
          <Title order={2} mb="md">Gotong royong Terbaru</Title>
          <Divider mb="xl" />

          {loadingGrid ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} h={300} radius="md" />
              ))}
            </SimpleGrid>
          ) : paginatedNews.length === 0 ? (
            <Text c="dimmed" ta="center">Tidak ada gotong royong ditemukan.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
              {paginatedNews.map((item) => (
                <Card
                  key={item.id}
                  shadow="sm"
                  p="lg"
                  radius="md"
                  withBorder
                >
                  <Card.Section>
                    <Image
                      src={item.image?.link || '/images/placeholder-small.jpg'}
                      height={200}
                      alt={item.judul}
                      fit="cover"
                    />
                  </Card.Section>

                  <Badge color="blue" variant="light" mt="md">
                    {item.kategoriKegiatan?.nama || 'Gotong royong'}
                  </Badge>

                  <Text fw={600} size="lg" mt="sm" lineClamp={2}>{item.judul}</Text>

                  <Text size="sm" c="dimmed" lineClamp={3} mt="xs">{item.deskripsiSingkat}</Text>

                  <Flex align="center" justify="apart" mt="md" gap="xs">
                    <Text size="xs" c="dimmed">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                    
                    <Button p="xs" variant="light" rightSection={<IconArrowRight size={16} />} onClick={() => router.push(`/darmasaba/lingkungan/gotong-royong/${item.kategoriKegiatan?.nama}/${item.id}`)}>Baca Selengkapnya</Button>
                  </Flex>
                </Card>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination hanya untuk berita terbaru */}
          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
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

export default Page;

