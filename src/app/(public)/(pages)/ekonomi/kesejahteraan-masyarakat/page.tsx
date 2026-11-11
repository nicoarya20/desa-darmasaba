/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateKesejahteraanMasyarakat from '@/app/admin/(dashboard)/_state/ekonomi/kesejahteraan-masyarakat';
import colors from '@/con/colors';
import {
  Badge, Box, Button, Card, Center, Container, Divider,
  Flex, Grid, GridCol, Group, Image, Pagination,
  Paper, SimpleGrid, Skeleton, Stack, Text, Title
} from '@mantine/core';
import { IconArrowRight, IconCalendar, IconDatabaseOff } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function KesejahteraanMasyarakatContent() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const state = useProxy(stateKesejahteraanMasyarakat.kesejahteraan);
  const featured = useProxy(stateKesejahteraanMasyarakat.kesejahteraan.findFirst);
  const loadingGrid = state.findMany.loading;
  const loadingFeatured = featured.loading;

  useEffect(() => {
    if (!featured.loaded && !loadingFeatured) {
      stateKesejahteraanMasyarakat.kesejahteraan.findFirst.load();
    }
  }, [featured.loaded, loadingFeatured]);

  useEffect(() => {
    const limit = 3;
    state.findMany.load(page, limit, search);
  }, [page, search]);

  const handlePageChange = (newPage: number) => {
    const url = new URLSearchParams(searchParams.toString());
    if (search) url.set('search', search);
    if (newPage > 1) url.set('page', newPage.toString());
    else url.delete('page');

    router.replace(`?${url.toString()}`);
  };

  const featuredData = featured.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: "md", md: "xl" }}>
        {/* === Program Utama === */}
        {loadingFeatured ? (
          <Center><Skeleton h={400} /></Center>
        ) : !featuredData && paginatedNews.length === 0 && !loadingGrid && !search ? (
          <Paper p="xl" withBorder radius="md">
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconDatabaseOff size={80} color={colors.grey['2']} />
                <Text ta="center" fz="lg" fw={500} c="dimmed">
                  Belum Ada Program Kesejahteraan
                </Text>
                <Text ta="center" fz="sm" c="dimmed" maw={400}>
                  Data program kesejahteraan masyarakat belum tersedia saat ini.
                  Silakan cek kembali di lain waktu.
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : featuredData ? (
          <Box mb={50}>
            <Title order={2} mb="md">Kesejahteraan Masyarakat</Title>
            <Paper shadow="md" radius="md" withBorder>
              <Grid gap={0}>
                <GridCol span={{ base: 12, md: 6 }}>
                  <Image
                    src={featuredData.image?.link || '/images/placeholderx.jpg'}
                    alt={featuredData.judul || 'Program Kesejahteraan'}
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
                        Kesejahteraan
                      </Badge>
                      <Title order={3} mb="md">{featuredData.judul}</Title>
                      <Text
                        c="dimmed"
                        lineClamp={3}
                        mb="md"
                        dangerouslySetInnerHTML={{ __html: featuredData.deskripsi }}
                        fz={{ base: 'sm', md: 'md' }}
                        lh={{ base: 1.5, md: 1.6 }}
                      />
                    </div>
                    <Group justify="space-between" mt="auto">
                      <Group gap="xs">
                        <IconCalendar size={18} />
                        <Text
                          c="dimmed"
                          fz={{ base: 'xs', md: 'sm' }}
                          lh={{ base: 1.4, md: 1.5 }}
                        >
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
                          router.push(`/ekonomi/kesejahteraan-masyarakat/${featuredData.id}`)
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

        {/* === Program Terbaru === */}
        {(loadingGrid || paginatedNews.length > 0 || search || !!featuredData) && (
          <Box mt={50}>
            <Title order={2} mb="md">Program Terbaru</Title>
            <Divider mb="xl" />

            {loadingGrid ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} h={300} radius="md" />
                ))}
              </SimpleGrid>
            ) : paginatedNews.length === 0 ? (
              <Paper p="xl" withBorder radius="md">
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <IconDatabaseOff size={48} color={colors.grey['2']} />
                    <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }} lh={{ base: 1.5, md: 1.6 }}>
                      {search
                        ? `Tidak ada program kesejahteraan yang cocok dengan pencarian "${search}".`
                        : 'Tidak ada program kesejahteraan ditemukan.'}
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
                {paginatedNews.map((item) => (
                  <Card
                    key={item.id}
                    shadow="sm"
                    p="lg"
                    radius="md"
                    withBorder
                    h="100%"
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <Card.Section>
                      <Image
                        src={item.image?.link || '/no-image.jpg'}
                        fallbackSrc="/no-image.jpg"
                        w="100%"
                        h={200}
                        alt={item.judul}
                        fit="cover"
                        loading="lazy"
                      />
                    </Card.Section>

                    <Badge color="blue" variant="light" mt="md">
                      Kesejahteraan
                    </Badge>

                    <Title order={4} mt="sm" lineClamp={2}>
                      {item.judul}
                    </Title>
                    <Text
                      c="dimmed"
                      lineClamp={3}
                      mt="xs"
                      dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                      fz={{ base: 'xs', md: 'sm' }}
                      lh={{ base: 1.5, md: 1.6 }}
                    />

                    <Flex align="center" justify="space-between" mt="auto" pt="md" gap="xs">
                      <Text
                        c="dimmed"
                        fz={{ base: 'xs', md: 'xs' }}
                        lh={{ base: 1.4, md: 1.4 }}
                      >
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
                          router.push(`/ekonomi/kesejahteraan-masyarakat/${item.id}`)
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
            {paginatedNews.length > 0 && (
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
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

function KesejahteraanMasyarakatPublic() {
  return (
    <Suspense fallback={<Center py={50}><Skeleton h={400} /></Center>}>
      <KesejahteraanMasyarakatContent />
    </Suspense>
  );
}

export default KesejahteraanMasyarakatPublic;
