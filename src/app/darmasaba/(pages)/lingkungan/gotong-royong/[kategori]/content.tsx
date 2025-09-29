/* eslint-disable react-hooks/exhaustive-deps */
'use client'
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
} from '@mantine/core';
import { IconArrowRight, IconCalendar } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

export default function Content({ kategori }: { kategori: string }) {
  const router = useTransitionRouter();
  const [page, setPage] = useState(1);

  const state = useProxy(gotongRoyongState.kegiatanDesa);
  const featuredState = useProxy(gotongRoyongState.kegiatanDesa.findFirst);

  const featured = featuredState.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  // Load data
  useEffect(() => {
    gotongRoyongState.kegiatanDesa.findFirst.load(kategori);
  }, [kategori]);

  useEffect(() => {
    state.findMany.load(page, 3, '', kategori);
  }, [page, kategori]);

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: 'md', md: 'xl' }}>
        {/* === Gotong Royong Utama === */}
        {featuredState.loading ? (
          <Center><Skeleton h={400} /></Center>
        ) : featured ? (
          <Box mb={50}>
            <Text fz="h2" fw={700} mb="md">Gotong Royong Utama</Text>
            <Paper shadow="md" radius="md" withBorder>
              <Grid gutter={0}>
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
                        {featured.kategoriKegiatan?.nama || kategori}
                      </Badge>
                      <Title order={2} mb="md">{featured.judul}</Title>
                      <Text color="dimmed" lineClamp={3} mb="md">{featured.deskripsiLengkap}</Text>
                    </div>
                    <Group justify="apart" mt="auto">
                      <Group gap="xs">
                        <IconCalendar size={18} />
                        <Text size="sm">
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
                        onClick={() => router.push(`/darmasaba/lingkungan/gotong-royong/${kategori}/${featured.id}`)}
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

        {/* === Daftar Gotong Royong === */}
        <Box mt={50}>
          <Title order={2} mb="md">Daftar Gotong Royong</Title>
          <Divider mb="xl" />

          {state.findMany.loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} h={300} radius="md" />
              ))}
            </SimpleGrid>
          ) : paginatedNews.length === 0 ? (
            <Text c="dimmed" ta="center">Belum ada gotong royong di kategori &quot;{kategori}&quot;.</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
              {paginatedNews.map((item) => (
                <Card
                  key={item.id}
                  shadow="sm"
                  p="lg"
                  radius="md"
                  withBorder
                  onClick={() => router.push(`/darmasaba/lingkungan/gotong-royong/${kategori}/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Section>
                    <Image src={item.image?.link} height={200} alt={item.judul} fit="cover" loading="lazy"/>
                  </Card.Section>
                  <Badge color="blue" variant="light" mt="md">
                    {item.kategoriKegiatan?.nama || kategori}
                  </Badge>
                  <Text fw={600} size="lg" mt="sm" lineClamp={2}>{item.judul}</Text>
                  <Text size="sm" color="dimmed" lineClamp={3} style={{wordBreak: "break-word", whiteSpace: "normal"}} mt="xs" dangerouslySetInnerHTML={{ __html: item.deskripsiLengkap }} />
                  <Group justify="apart" mt="md" gap="xs">
                    <Text size="xs" color="dimmed">
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