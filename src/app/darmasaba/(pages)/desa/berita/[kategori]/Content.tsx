/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
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
} from '@mantine/core';
import { IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

export default function Content({ kategori }: { kategori: string }) {
  const router = useTransitionRouter();
  const [page, setPage] = useState(1);

  const state = useProxy(stateDashboardBerita.berita);
  const featuredState = useProxy(stateDashboardBerita.berita.findFirst);

  const featured = featuredState.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  // Load data
  useEffect(() => {
    stateDashboardBerita.berita.findFirst.load(kategori);
  }, [kategori]);

  useEffect(() => {
    state.findMany.load(page, 3, '', kategori);
  }, [page, kategori]);

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: 'md', md: 'xl' }}>
        {/* === Berita Utama === */}
        {featuredState.loading ? (
          <Center>
            <Skeleton h={400} />
          </Center>
        ) : featured ? (
          <Box mb={50}>
            <Title order={2} mb="md">
              Berita Utama
            </Title>
            <Paper shadow="md" radius="md" withBorder>
              <Grid gap={0}>
                <GridCol span={{ base: 12, md: 6 }}>
                  <Image
                    src={featured.image?.link}
                    alt={featured.judul || 'Berita Utama'}
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
                        {featured.kategoriBerita?.name || kategori}
                      </Badge>
                      <Title order={3} mb="md">
                        {featured.judul}
                      </Title>
                      <Text
                        c="dimmed"
                        lineClamp={3}
                        mb="md"
                        style={{ lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: featured.deskripsi }}
                      />
                    </div>
                    <Group justify="space-between" mt="auto">
                      <Group gap="xs">
                        <IconCalendar size={18} />
                        <Text
                          fz={{ base: 'xs', md: 'sm' }}
                          c="dimmed"
                          lh={1.5}
                          style={{
                            fontSize: '0.875rem',
                            lineHeight: '1.5rem',
                          }}
                        >
                          {new Date(featured.createdAt).toLocaleDateString('id-ID', {
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
                          router.push(`/darmasaba/desa/berita/${kategori}/${featured.id}`)
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

        {/* === Daftar Berita === */}
        <Box mt={50}>
          <Title order={2} mb="md">
            Daftar Berita
          </Title>
          <Divider mb="xl" />

          {state.findMany.loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} h={300} radius="md" />
                ))}
            </SimpleGrid>
          ) : paginatedNews.length === 0 ? (
            <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }} lh={1.5}>
              Belum ada berita di kategori &quot;{kategori}&quot;.
            </Text>
          ) : (
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 3 }}
              spacing="xl"
              verticalSpacing="xl"
            >
              {paginatedNews.map((item) => (
                <Card
                  key={item.id}
                  shadow="sm"
                  p="lg"
                  radius="md"
                  withBorder
                  h="100%"
                  onClick={() =>
                    router.push(`/darmasaba/desa/berita/${kategori}/${item.id}`)
                  }
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
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
                    {item.kategoriBerita?.name || kategori}
                  </Badge>
                  <Title
                    order={4}
                    mt="sm"
                    fz={{ base: 'sm', md: 'md' }}
                    style={{ lineHeight: 1.4 }}
                    lineClamp={2}
                  >
                    {item.judul}
                  </Title>
                  <Text
                    fz={{ base: 'xs', md: 'sm' }}
                    c="dimmed"
                    lineClamp={3}
                    style={{
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.5,
                    }}
                    mt="xs"
                    dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                  />
                  <Group justify="space-between" mt="auto" pt="md" gap="xs">
                    <Text
                      fz={{ base: 'xs', md: 'xs' }}
                      c="dimmed"
                      lh={1.4}
                      style={{ fontSize: '0.75rem', lineHeight: '1.125rem' }}
                    >
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <Badge color="gray" variant="outline">Baca Selengkapnya</Badge>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={page}
              onChange={(newPage) => setPage(newPage)}
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