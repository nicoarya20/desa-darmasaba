/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '@mantine/core';
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

export default function Content({ kategori }: { kategori: string }) {
  const router = useTransitionRouter();
  const [page, setPage] = useState(1);
  const [animateKey, setAnimateKey] = useState(0);

  const state = useProxy(gotongRoyongState.kegiatanDesa);
  const featuredState = useProxy(gotongRoyongState.kegiatanDesa.findFirst);

  const featured = featuredState.data;
  const paginatedNews = state.findMany.data || [];
  const totalPages = state.findMany.totalPages || 1;

  // Load data awal
  useEffect(() => {
    gotongRoyongState.kegiatanDesa.findFirst.load(kategori);
  }, [kategori]);

  // Load daftar berita
  useEffect(() => {
    state.findMany.load(page, 3, '', kategori);
    setAnimateKey((prev) => prev + 1); // trigger animasi halus saat page berubah
  }, [page, kategori]);

  // Tampilan kosong
  if (!featuredState.loading && !featured) {
    return (
      <Center py={100}>
        <Stack align="center" gap="sm">
          <Title order={3}>Belum Ada Data Gotong Royong</Title>
          <Text c="dimmed">Tidak ada data gotong royong yang tersedia saat ini.</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box py={20}>
      <Container size="xl" px={{ base: 'md', md: 'xl' }}>
        {/* === Gotong Royong Utama === */}
        <Transition mounted={!featuredState.loading} transition="fade" duration={250} timingFunction="ease">
          {(styles) => (
            <div style={styles}>
              {featured ? (
                <Box mb={50}>
                  <Text fz="h2" fw={700} mb="md">Gotong Royong Utama</Text>
                  <Paper shadow="md" radius="md" withBorder>
                    <Grid gap={0}>
                      <GridCol span={{ base: 12, md: 6 }}>
                        <Image
                          src={featured.image?.link || '/no-image.jpg'}
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
                            <Text
                              c="dimmed"
                              lineClamp={3}
                              mb="md"
                              dangerouslySetInnerHTML={{ __html: featured.deskripsiLengkap }}
                            />
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
                              onClick={() =>
                                router.push(`/lingkungan/gotong-royong/${kategori}/${featured.id}`)
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
                <Skeleton h={400} radius="md" />
              )}
            </div>
          )}
        </Transition>

        {/* === Daftar Gotong Royong (Pagination + Fade-in Halus) === */}
        <Box mt={50}>
          <Title order={2} mb="md">Daftar Gotong Royong</Title>
          <Divider mb="xl" />

          <AnimatePresence mode="wait">
            <motion.div
              key={animateKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {state.findMany.loading ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} h={300} radius="md" />
                    ))}
                </SimpleGrid>
              ) : paginatedNews.length === 0 ? (
                <Center py={50}>
                  <Stack align="center" gap="sm">
                    <Title order={3}>Tidak Ada Data</Title>
                    <Text c="dimmed">Belum ada data gotong royong yang tersedia.</Text>
                  </Stack>
                </Center>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" verticalSpacing="xl">
                  {paginatedNews.map((item) => (
                    <Card
                      key={item.id}
                      shadow="sm"
                      p="lg"
                      radius="md"
                      withBorder
                      onClick={() => router.push(`/lingkungan/gotong-royong/${kategori}/${item.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Section>
                        <Image
                          src={item.image?.link || '/no-image.jpg'}
                          height={200}
                          alt={item.judul}
                          fit="cover"
                          loading="lazy"
                        />
                      </Card.Section>
                      <Badge color="blue" variant="light" mt="md">
                        {item.kategoriKegiatan?.nama || kategori}
                      </Badge>
                      <Text fw={600} size="lg" mt="sm" lineClamp={2}>
                        {item.judul}
                      </Text>
                      <Text
                        size="sm"
                        c="dimmed"
                        lineClamp={3}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        mt="xs"
                        dangerouslySetInnerHTML={{ __html: item.deskripsiLengkap }}
                      />
                      <Group justify="apart" mt="lg" gap="xs">
                        <Text size="xs" c="dimmed">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        <Button variant="light" size="xs" rightSection={<IconArrowRight size={14} />}>Baca Selengkapnya</Button>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </motion.div>
          </AnimatePresence>

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
