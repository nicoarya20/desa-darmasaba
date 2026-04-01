/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { Badge, Box, Card, Divider, Grid, GridCol, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';
import { useTransitionRouter } from 'next-view-transitions';
import { motion } from "framer-motion";

dayjs.extend(relativeTime);

function InformasiDesa() {
  const router = useTransitionRouter()
  const stateBerita = useProxy(stateDashboardBerita.berita);
  const statePengumuman = useProxy(stateDesaPengumuman.pengumuman);

  useEffect(() => {
    stateBerita.findFirst.load();
    stateBerita.findRecent.load();
    statePengumuman.findFirst.load();
    statePengumuman.findRecent.load();
  }, []);

  const dataBerita = stateBerita.findFirst.data;
  const dataPengumuman = statePengumuman.findFirst.data;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Title ta="center" fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
          Informasi Desa
        </Title>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap={30}>

          {/* === BERITA UTAMA === */}
          {dataBerita && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/darmasaba/inovasi/layanan-online-desa/informasi-desa/detail-berita/${dataBerita.id}`)}
            >
              <Paper shadow="md" radius="lg" p="lg" withBorder>
                <Grid align="center" gutter="xl">
                  <GridCol span={{ base: 12, md: 6 }}>
                    <Image
                      src={dataBerita.image?.link || '/fallback.jpg'}
                      alt={dataBerita.judul}
                      radius="md"
                      fit="cover"
                      height={280}
                      loading="lazy"
                      style={{ objectPosition: 'center' }}
                    />
                  </GridCol>
                  <GridCol span={{ base: 12, md: 6 }}>
                    <Stack gap="xs">
                      <Title order={2} fw={800}>
                        {dataBerita.judul}
                      </Title>
                      <Group justify='space-between'>
                        <Badge bg={colors['blue-button']}>
                          {dataBerita.kategoriBerita?.name}
                        </Badge>
                        <Text fz="sm" c="dimmed">
                          {dayjs(dataBerita.createdAt).fromNow()}
                        </Text>
                      </Group>
                      <Text
                        ta="justify"
                        mt="xs"
                        fz="md"
                        lh={1.7}
                        lineClamp={6}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        dangerouslySetInnerHTML={{ __html: dataBerita.content }}
                      />
                    </Stack>
                  </GridCol>
                </Grid>
              </Paper>
            </motion.div>
          )}

          {/* === BERITA TERBARU === */}
          <Stack>
            <Title order={3} fw={700}>
              Berita Terbaru
            </Title>
            <Grid gutter="xl">
              {stateBerita.findRecent.data.map((item) => (
                <GridCol span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/darmasaba/inovasi/layanan-online-desa/informasi-desa/detail-berita/${item.id}`)}
                  >
                    <Card
                      shadow="sm"
                      radius="md"
                      withBorder
                      h="100%"
                    >
                      <Card.Section>
                        <Image
                          src={item.image?.link || '/placeholder.jpg'}
                          alt={item.judul}
                          height={160}
                          fit="cover"
                          radius="sm"
                          loading="lazy"
                        />
                      </Card.Section>
                      <Stack gap={4} mt="sm">
                        <Text ta="justify"
                          size="sm"
                          c="dimmed"
                          lineClamp={3}
                          style={{
                            wordBreak: "break-word",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                          dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }} />
                        <Text size="xs" c="gray">
                          {dayjs(item.createdAt).fromNow()}
                        </Text>
                      </Stack>
                    </Card>
                  </motion.div>
                </GridCol>
              ))}
            </Grid>
          </Stack>

          <Divider color={colors['blue-button']} my="lg" />

          {/* === PENGUMUMAN === */}
          <Grid gutter="xl" align="stretch">
            <GridCol span={{ base: 12, md: 6 }}>
              {dataPengumuman && (
                <motion.div
                  onClick={() => router.push(`/darmasaba/inovasi/layanan-online-desa/informasi-desa/detail-pengumuman/${dataPengumuman.id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ cursor: "pointer" }}
                >
                  <Paper shadow="md" radius="lg" p="lg" h="100%" withBorder>
                    <Stack gap="xs">
                      <Title order={2} fw={800}>
                        {dataPengumuman.judul}
                      </Title>
                      <Group justify='space-between'>
                        <Badge bg={colors['blue-button']}>
                          {dataPengumuman.CategoryPengumuman?.name}
                        </Badge>
                        <Text fz="sm" c="dimmed">
                          {dayjs(dataPengumuman.createdAt).fromNow()}
                        </Text>
                      </Group>
                      <Text
                        ta="justify"
                        mt="xs"
                        fz="md"
                        lh={1.7}
                        lineClamp={8}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                        dangerouslySetInnerHTML={{ __html: dataPengumuman.content }}
                      />
                    </Stack>
                  </Paper>
                </motion.div>
              )}
            </GridCol>

            <GridCol span={{ base: 12, md: 6 }}>
              <Stack>
                <Title order={3} fw={700}>
                  Pengumuman Terbaru
                </Title>
                <Grid gutter="lg">
                  {statePengumuman.findRecent.data.map((item) => (
                    <GridCol span={{ base: 12, sm: 6 }} key={item.id}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push(`/darmasaba/inovasi/layanan-online-desa/informasi-desa/detail-pengumuman/${item.id}`)}
                      >
                        <Card
                          shadow="xs"
                          radius="md"
                          withBorder
                          h="100%"
                          p="md"
                          style={{ transition: '0.2s ease' }}
                          className="hover:shadow-md"
                        >
                          <Stack gap="xs">
                            <Text fw={600} lineClamp={2}>
                              {item.judul}
                            </Text>
                            <Text
                              ta="justify"
                              mt="xs"
                              fz="md"
                              lh={1.7}
                              lineClamp={2}
                              style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                              dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                            <Text size="xs" c="gray">
                              {dayjs(item.createdAt).fromNow()}
                            </Text>
                          </Stack>
                        </Card>
                      </motion.div>
                    </GridCol>
                  ))}
                </Grid>
              </Stack>
            </GridCol>
          </Grid>
        </Stack>
      </Box>
    </Stack>
  );
}

export default InformasiDesa;
