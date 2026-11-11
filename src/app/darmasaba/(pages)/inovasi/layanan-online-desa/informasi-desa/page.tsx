/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { tanggalPengumuman } from '@/lib/pengumuman-tanggal';
import { tanggalTerbitAtauDibuat } from '@/lib/tanggal-terbit';
import { PengumumanThumbnail } from '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/PengumumanLampiran';
import { Badge, Box, Button, Grid, GridCol, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconClock, IconNews, IconSpeakerphone } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../pemerintahan/layanan/_com/BackButto';
import BeritaCard from './_com/BeritaCard';
import { CardSkeleton } from './_com/CardSkeleton';
import EmptyState from './_com/EmptyState';
import PengumumanCard from './_com/PengumumanCard';
import SectionTitle from './_com/SectionTitle';
import { timeAgoId } from './_com/timeAgo';

const BASE = '/darmasaba/inovasi/layanan-online-desa/informasi-desa';

function InformasiDesa() {
  const router = useTransitionRouter();
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
  const recentBerita = stateBerita.findRecent.data;
  const recentPengumuman = statePengumuman.findRecent.data;

  const loadingBeritaRecent = stateBerita.findRecent.loading;
  const loadingPengumumanRecent = statePengumuman.findRecent.loading;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={28}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* === HEADER HALAMAN === */}
      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap={4} align="center">
          <Title ta="center" fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
            Informasi Desa
          </Title>
          <Text ta="center" fz={{ base: 'sm', md: 'md' }} c="dimmed" maw={640}>
            Berita terbaru dan pengumuman resmi seputar kegiatan serta pelayanan
            Desa Darmasaba.
          </Text>
        </Stack>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap={36}>

          {/* === BERITA UTAMA (HERO) === */}
          {dataBerita && (
            <Stack gap="md">
              <SectionTitle
                title="Berita Utama"
                subtitle="Sorotan terbaru dari desa"
                icon={<IconNews size={22} />}
              />
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`${BASE}/detail-berita/${dataBerita.id}`)}
              >
                <Paper shadow="md" radius="lg" p="lg" withBorder>
                  <Grid align="stretch" gap="xl">
                    <GridCol span={{ base: 12, md: 5 }}>
                      <Image
                        src={dataBerita.image?.link || '/no-image.jpg'}
                        fallbackSrc="/no-image.jpg"
                        alt={dataBerita.judul}
                        radius="md"
                        fit="cover"
                        w="100%"
                        h={{ base: 200, md: 260 }}
                        loading="lazy"
                        style={{ objectPosition: 'center' }}
                      />
                    </GridCol>
                    <GridCol span={{ base: 12, md: 7 }}>
                      <Stack gap="sm" h="100%" justify="center">
                        {dataBerita.kategoriBerita?.name && (
                          <Badge bg={colors['blue-button']} radius="sm" w="fit-content">
                            {dataBerita.kategoriBerita.name}
                          </Badge>
                        )}
                        <Title order={2} fw={800} lineClamp={3} c={colors['blue-button-7']}>
                          {dataBerita.judul}
                        </Title>
                        <Group gap={5} c="gray">
                          <IconClock size={15} />
                          <Text fz="sm" c="dimmed">
                            {timeAgoId(tanggalTerbitAtauDibuat(dataBerita))}
                          </Text>
                        </Group>
                        <Text
                          ta="justify"
                          fz="sm"
                          lh={1.7}
                          c="dimmed"
                          lineClamp={5}
                          style={{ wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: dataBerita.deskripsi || dataBerita.content }}
                        />
                        <Button
                          variant="light"
                          color="blue"
                          radius="md"
                          rightSection={<IconArrowRight size={16} />}
                          w="fit-content"
                          mt={4}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${BASE}/detail-berita/${dataBerita.id}`);
                          }}
                        >
                          Baca selengkapnya
                        </Button>
                      </Stack>
                    </GridCol>
                  </Grid>
                </Paper>
              </motion.div>
            </Stack>
          )}

          {/* === BERITA TERBARU === */}
          <Stack gap="md">
            <SectionTitle
              title="Berita Terbaru"
              subtitle="Kabar dan liputan kegiatan desa"
              icon={<IconNews size={22} />}
            />
            <Grid gap="lg">
              {loadingBeritaRecent && recentBerita.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <GridCol span={{ base: 12, sm: 6, md: 3 }} key={i}>
                      <CardSkeleton />
                    </GridCol>
                  ))
                : recentBerita.length === 0
                  ? <GridCol span={12}><EmptyState label="Belum ada berita terbaru." /></GridCol>
                  : recentBerita.map((item) => (
                      <GridCol span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
                        <BeritaCard
                          judul={item.judul}
                          deskripsi={item.deskripsi}
                          imageLink={item.image?.link}
                          kategori={item.kategoriBerita?.name}
                          tanggal={tanggalTerbitAtauDibuat(item)}
                          onClick={() => router.push(`${BASE}/detail-berita/${item.id}`)}
                        />
                      </GridCol>
                    ))}
            </Grid>
          </Stack>

          {/* === PENGUMUMAN === */}
          <Grid gap="xl" align="start">
            {/* Pengumuman utama */}
            <GridCol span={{ base: 12, md: 5 }}>
              <Stack gap="md">
                <SectionTitle
                  title="Pengumuman Utama"
                  subtitle="Informasi resmi terkini"
                  icon={<IconSpeakerphone size={22} />}
                />
                {dataPengumuman ? (
                  <motion.div
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`${BASE}/detail-pengumuman/${dataPengumuman.id}`)}
                  >
                    <Paper
                      shadow="md"
                      radius="lg"
                      p="xl"
                      withBorder
                      style={{ borderLeft: `5px solid ${colors['blue-button']}` }}
                    >
                      <Stack gap="sm">
                        <PengumumanThumbnail image={dataPengumuman.image} judul={dataPengumuman.judul} />
                        {dataPengumuman.CategoryPengumuman?.name && (
                          <Badge bg={colors['blue-button']} radius="sm" w="fit-content">
                            {dataPengumuman.CategoryPengumuman.name}
                          </Badge>
                        )}
                        <Title order={3} fw={800} lineClamp={3} c={colors['blue-button-7']}>
                          {dataPengumuman.judul}
                        </Title>
                        <Group gap={5} c="gray">
                          <IconClock size={15} />
                          <Text fz="sm" c="dimmed">
                            {timeAgoId(tanggalPengumuman(dataPengumuman))}
                          </Text>
                        </Group>
                        <Text
                          ta="justify"
                          fz="sm"
                          lh={1.7}
                          c="dimmed"
                          lineClamp={6}
                          style={{ wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: dataPengumuman.deskripsi || dataPengumuman.content }}
                        />
                        <Button
                          variant="light"
                          color="blue"
                          radius="md"
                          rightSection={<IconArrowRight size={16} />}
                          w="fit-content"
                          mt={4}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${BASE}/detail-pengumuman/${dataPengumuman.id}`);
                          }}
                        >
                          Baca selengkapnya
                        </Button>
                      </Stack>
                    </Paper>
                  </motion.div>
                ) : (
                  <Paper radius="lg" p="xl" withBorder>
                    <EmptyState label="Belum ada pengumuman." />
                  </Paper>
                )}
              </Stack>
            </GridCol>

            {/* Pengumuman terbaru */}
            <GridCol span={{ base: 12, md: 7 }}>
              <Stack gap="md">
                <SectionTitle
                  title="Pengumuman Terbaru"
                  subtitle="Daftar pengumuman lainnya"
                  icon={<IconSpeakerphone size={22} />}
                />
                <Grid gap="md" align="stretch">
                  {loadingPengumumanRecent && recentPengumuman.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <GridCol span={{ base: 12, sm: 6 }} key={i}>
                          <CardSkeleton withImage={false} />
                        </GridCol>
                      ))
                    : recentPengumuman.length === 0
                      ? <GridCol span={12}><EmptyState label="Belum ada pengumuman terbaru." /></GridCol>
                      : recentPengumuman.map((item) => (
                          <GridCol span={{ base: 12, sm: 6 }} key={item.id}>
                            <PengumumanCard
                              judul={item.judul}
                              deskripsi={item.deskripsi || item.content}
                              createdAt={tanggalPengumuman(item)}
                              onClick={() => router.push(`${BASE}/detail-pengumuman/${item.id}`)}
                            />
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
