/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Box, Button, Center, Container, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Tooltip, ActionIcon } from '@mantine/core';
import { IconChalkboard, IconMicroscope, IconProps, IconRefresh, IconSchool, IconInfoCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';



interface Stat {
  jenjangPendidikan: any;
  icon: React.ComponentType<IconProps>;
  jumlah: number;
  nama: string;
  helper?: string;
  loading?: boolean;
}

export default function KategoriPage({ jenjangPendidikan }: { jenjangPendidikan: string }) {
  const router = useTransitionRouter();
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Decode the URL parameter
  const decodedJenjangPendidikan = decodeURIComponent(jenjangPendidikan);
  const jenjangFilter = decodedJenjangPendidikan.toLowerCase() === 'semua'
    ? undefined
    : decodedJenjangPendidikan;

  const loadData = useCallback(async () => {
    if (!decodedJenjangPendidikan) return;

    try {
      setIsLoading(true);

      // Load all data in parallel with the jenjang filter
      await Promise.all([
        infoSekolahPaud.lembagaPendidikan.findMany.load(1, 100, '', jenjangFilter),
        infoSekolahPaud.siswa.findMany.load(1, 100, '', jenjangFilter),
        infoSekolahPaud.pengajar.findMany.load(1, 100, '', jenjangFilter),
      ]);

      // Get filtered totals based on jenjang
      const totalLembaga = infoSekolahPaud.lembagaPendidikan.findMany.total || 0;
      const totalSiswa = infoSekolahPaud.siswa.findMany.total || 0;
      const totalPengajar = infoSekolahPaud.pengajar.findMany.total || 0;

      setStats([
        {

          icon: IconChalkboard,
          jumlah: totalLembaga,
          nama: 'Lembaga Pendidikan',
          helper: 'Jumlah institusi pendidikan resmi di wilayah ini',
          loading: false,
          jenjangPendidikan: decodedJenjangPendidikan,
        },
        {
          icon: IconSchool,
          jumlah: totalSiswa,
          nama: 'Siswa Terdaftar',
          helper: 'Total siswa aktif di semua jenjang',
          loading: false,
          jenjangPendidikan: decodedJenjangPendidikan,
        },
        {
          icon: IconMicroscope,
          jumlah: totalPengajar,
          nama: 'Tenaga Pengajar',
          helper: 'Jumlah guru dan staf pengajar aktif',
          loading: false,
          jenjangPendidikan: decodedJenjangPendidikan,
        },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set error state or show toast notification
    } finally {
      setIsLoading(false);
    }
  }, [decodedJenjangPendidikan, jenjangFilter]);

  useEffect(() => {
    loadData();
  }, [loadData, decodedJenjangPendidikan]);

  const handleRefresh = () => {
    loadData();
  };

  const hasilCount = stats.reduce((sum, stat) => sum + stat.jumlah, 0);
  const filtered = stats;

  if (isLoading) {
    return (
      <Box style={{ minHeight: '100vh', background: '#f8fafc', padding: '48px 0' }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={260} radius="lg" />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 48 }}>
      <Container size="xl" py={{ base: 'md', md: 'xl' }}>
        <Box>
          <Group justify="space-between" mb="md">
            <Box aria-live="polite" aria-atomic>
              <Text fz="sm" c="dimmed">
                Menampilkan <Text component="span" c="#0f172a" fw={700}>{hasilCount}</Text> hasil.
              </Text>
            </Box>
            <Button
              leftSection={<IconRefresh color={colors['blue-button']} size={16} />}
              variant="outline"
              size="xs"
              onClick={handleRefresh}
              loading={stats.some(stat => stat.loading)}
              c={colors['blue-button']}
              style={{
                borderColor: colors['blue-button'],
              }}
            >
              Segarkan Data
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {filtered.length === 0 ? (
              <Paper
                p="xl"
                radius="md"
                style={{
                  background: '#f9fafb',
                  border: '1px dashed #e2e8f0',
                  minHeight: 220,
                }}
                role="status"
                aria-label="Tidak ada hasil"
              >
                <Center style={{ minHeight: 180, flexDirection: 'column' }}>
                  <Text fz="lg" fw={800} c={colors['blue-button']}>
                    Tidak ditemukan
                  </Text>
                  <Text c="dimmed" mt="6px">
                    Coba gunakan kata kunci lain atau setel ulang filter.
                  </Text>
                  <Button
                    mt="md"
                    radius="xl"
                    onClick={handleRefresh}
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                      color: 'white',
                      boxShadow: '0 6px 18px rgba(59,130,246,0.25)',
                    }}
                    aria-label="Tampilkan semua"
                  >
                    Tampilkan Semua
                  </Button>
                </Center>
              </Paper>
            ) : (
              filtered.map((v) => (
                <motion.div
                  key={v.nama}
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.995 }}
                  style={{ width: '100%' }}
                >
                  <Skeleton visible={v.loading}>
                    <Paper
                      p="lg"
                      radius="lg"
                      style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
                        minHeight: 260,
                      }}
                      role="article"
                      aria-label={`${v.nama} kartu statistik`}
                    >
                      <Stack gap="sm" mb="md">
                        <Center>
                          <Box
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#eff6ff',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                            }}
                            aria-hidden
                          >
                            {React.createElement(v.icon, {
                              color: colors['blue-button'],
                              size: 34,
                              stroke: 1.6,
                            })}
                          </Box>
                        </Center>

                        <Group justify="center" align="center" gap="xs">
                          <Stack gap={0}>
                            <Text ta={"center"} fz={{ base: 18, md: 22 }} fw={800} c="#0f172a">
                              {v.jumlah.toLocaleString()}
                            </Text>
                            <Group gap={6} align="center">
                              <Text ta={"center"} fz="sm" fw={700} c={colors['blue-button']}>
                                {v.nama}
                              </Text>
                              <Tooltip label={v.helper ?? ''} position="right" withArrow>
                                <ActionIcon aria-label={`Info ${v.nama}`} variant="transparent" size="xs">
                                  <IconInfoCircle size={16} style={{ color: colors['blue-button'] }} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Stack>
                        </Group>
                      </Stack>

                      <Group justify="center" mt="8px">
                        <Button
                          radius="xl"
                          variant="outline"
                          aria-label={`Lihat detail ${v.nama}`}
                          style={{
                            borderColor: colors['blue-button'],
                            color: colors['blue-button'],
                            paddingLeft: 20,
                            paddingRight: 20,
                          }}
                          onClick={() => {
                            if (v.nama === "Lembaga Pendidikan") router.push(`/pendidikan/info-sekolah/${jenjangPendidikan}/lembaga`);
                            if (v.nama === "Siswa Terdaftar") router.push(`/pendidikan/info-sekolah/${jenjangPendidikan}/siswa`);
                            if (v.nama === "Tenaga Pengajar") router.push(`/pendidikan/info-sekolah/${jenjangPendidikan}/pengajar`);
                          }}
                        >
                          Lihat Detail
                        </Button>
                      </Group>
                    </Paper>
                  </Skeleton>
                </motion.div>
              ))
            )}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
