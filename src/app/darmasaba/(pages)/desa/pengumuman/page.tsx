'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import {
  Anchor,
  Box,
  Center,
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Notification,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton
} from '@mantine/core';
import { IconCalendar, IconClock, IconSearch } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../layanan/_com/BackButto';

function Page() {
  const router = useTransitionRouter();

  // State lokal
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const state = useProxy(stateDesaPengumuman.pengumuman);
  const totalPages = state.findMany.totalPages || 1;
  const recent = useProxy(stateDesaPengumuman.pengumuman.findRecent);
  // Snapshot cabang category agar daftar kategori re-render saat load() async
  // selesai — sebelumnya JSX baca raw proxy & tak subscribe (race intermiten).
  const categoryState = useProxy(stateDesaPengumuman.category);

  // ✅ Baca URL saat pertama kali mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearch = urlParams.get('search') || '';
    const urlPage = parseInt(urlParams.get('page') || '1');

    setSearch(urlSearch);
    setSearchInput(urlSearch);
    setPage(Math.max(1, urlPage)); // Pastikan page >= 1
  }, []);

  // ✅ Sinkronkan URL saat `search` atau `page` berubah
  useEffect(() => {
    const url = new URL(window.location.href);
    if (search) {
      url.searchParams.set('search', search);
    } else {
      url.searchParams.delete('search');
    }
    if (page > 1) {
      url.searchParams.set('page', page.toString());
    } else {
      url.searchParams.delete('page');
    }
    router.replace(url.toString());
  }, [search, page, router]);

  // ✅ Debounce untuk pencarian
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1); // Reset ke halaman 1 saat pencarian baru
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, search]);

  // ✅ Load data dari state (valtio)
  useEffect(() => {
    stateDesaPengumuman.category.findMany.load();
    stateDesaPengumuman.pengumuman.findRecent.load();
    state.findMany.load(page, 3, search);
  }, [search, page]); // 🔁 Depend pada `search` dan `page`

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Container size="lg" px="md">
        <Stack align="center" gap="0">
          <Title
            order={1}
            c={colors['blue-button']}
            ta="center"
          >
            Pengumuman Desa Darmasaba
          </Title>
          <Text ta="center" px="md" pb={10} fz={{ base: 'sm', md: 'md' }} lh="sm">
            Informasi dan pengumuman resmi terkait kegiatan dan kebijakan Desa Darmasaba
          </Text>
        </Stack>
      </Container>

      {/* Recent & Kategori */}
      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Stack>
            {!recent.data?.length ? (
              <Notification withCloseButton={false} h={100}>
                Tidak ada pengumuman yang ditemukan
              </Notification>
            ) : (
              recent.data
                ?.slice(0, 2)
                .map((item, index) => (
                  <Notification
                    key={item.id}
                    color={index === 0 ? undefined : 'yellow'}
                    styles={{ title: { fontWeight: 'bold' } }}
                    withCloseButton={false}
                    title={item.CategoryPengumuman?.name || 'Pengumuman'}
                  >
                    <Stack gap="xs">
                      <Text fz={{ base: 'sm', md: 'sm' }} fw="bold" c="black" style={{ textTransform: 'uppercase' }}>
                        {item.judul}
                      </Text>
                      <Text ta="justify" fz={{ base: 'xs', md: 'sm' }} c="black" lineClamp={3} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </Stack>
                    <Group pt={20} gap="md" justify="space-between">
                      <Group style={{ color: 'black' }}>
                        <Group gap="xs">
                          <IconCalendar size={18} />
                          <Text fz={{ base: 'xs', md: 'sm' }}>
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconClock size={18} />
                          <Text fz={{ base: 'xs', md: 'sm' }}>
                            {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZoneName: 'short',
                            })}
                          </Text>
                        </Group>
                      </Group>
                      <Anchor variant="transparent" href={`/darmasaba/desa/pengumuman/${item.CategoryPengumuman?.name}/${item.id}`}>
                        <Text fs="unset" c={colors['blue-button']} fz={{ base: 'xs', md: 'sm' }}>
                          Baca Selengkapnya
                        </Text>
                      </Anchor>
                    </Group>
                  </Notification>
                ))
            )}
          </Stack>

          <Paper p="md">
            <Stack gap="xs">
              <Title order={3} c={colors['blue-button']}>
                Kategori
              </Title>
              {categoryState.findMany.data?.map((v: any, k) => {
                const count = v._count?.pengumumans || 0;
                return (
                  <UnstyledButton component={Link} href={`/darmasaba/desa/pengumuman/${v.name}`} key={k}>
                    <Paper bg={colors['BG-trans']} p={5}>
                      <Group px={3} justify="space-between">
                        <Text fz={{ base: 'sm', md: 'md' }} c="black">
                          {v.name}
                        </Text>
                        <Text fz={{ base: 'sm', md: 'md' }} c="black">
                          {count}
                        </Text>
                      </Group>
                    </Paper>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>

      {/* Daftar Pengumuman */}
      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="xs">
          <Divider mb={10} color={colors['blue-button']} />
          <Grid>
            <GridCol span={{ base: 12, md: 8 }}>
              <Title order={2}>Daftar Pengumuman</Title>
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Cari Pengumuman"
                radius="lg"
                leftSection={<IconSearch size={20} />}
                w="100%"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                fz={{ base: 'sm', md: 'md' }}
              />
            </GridCol>
          </Grid>

          {/* Loading */}
          {state.findMany.loading ? (
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={400} />
              ))}
            </SimpleGrid>
          ) : !state.findMany.data?.length ? (
            <Notification withCloseButton={false} h={100}>
              <Text fz={{ base: 'sm', md: 'md' }} ta="center">
                Tidak ada pengumuman yang ditemukan
              </Text>
            </Notification>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" verticalSpacing="lg">
              {state.findMany.data.map((item) => (
                <Paper key={item.id} p="md" withBorder radius="md" h="100%">
                  <Stack h="100%" justify="space-between">
                    <div>
                      <Text fw={600} c={colors['blue-button']} mb={5} fz={{ base: 'sm', md: 'md' }}>
                        {item.CategoryPengumuman?.name || 'Pengumuman'}
                      </Text>
                      <Text fw={700} mb="sm" lineClamp={2} style={{ textTransform: 'uppercase' }} fz={{ base: 'sm', md: 'lg' }}>
                        {item.judul}
                      </Text>
                      <Text
                        c="dimmed"
                        lineClamp={4}
                        dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                        mb="md"
                        style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                        fz={{ base: 'xs', md: 'sm' }}
                      />
                    </div>
                    <div>
                      <Group mb="sm" c="dimmed">
                        <Group gap={5}>
                          <IconCalendar size={16} />
                          <Text fz={{ base: 'xs', md: 'xs' }}>
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                        </Group>
                        <Group gap={5}>
                          <IconClock size={16} />
                          <Text fz={{ base: 'xs', md: 'xs' }}>
                            {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </Group>
                        <Anchor variant="transparent" href={`/darmasaba/desa/pengumuman/${item.CategoryPengumuman?.name}/${item.id}`}>
                          <Text fw={600} c={colors['blue-button']} fz={{ base: 'sm', md: 'sm' }}>
                            Baca Selengkapnya →
                          </Text>
                        </Anchor>
                      </Group>
                    </div>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          <Center mt="xl">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              siblings={1}
              boundaries={1}
              withEdges
              fz={{ base: 'xs', md: 'sm' }}
            />
          </Center>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;