/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import type { IconProps } from '@tabler/icons-react';
import {
  IconChalkboard,
  IconInfoCircle,
  IconMicroscope,
  IconRefresh,
  IconSchool,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

type Stat = {
  icon: React.ComponentType<IconProps>;
  jumlah: number;
  nama: string;
  helper?: string;
  loading?: boolean;
};

export default function SekolahPage() {
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: IconChalkboard,
      jumlah: 0,
      nama: 'Lembaga Pendidikan',
      helper: 'Jumlah institusi pendidikan resmi di wilayah ini',
      loading: true,
    },
    {
      icon: IconSchool,
      jumlah: 0,
      nama: 'Siswa Terdaftar',
      helper: 'Total siswa aktif di semua jenjang',
      loading: true,
    },
    {
      icon: IconMicroscope,
      jumlah: 0,
      nama: 'Tenaga Pengajar',
      helper: 'Jumlah guru dan staf pengajar aktif',
      loading: true,
    },
  ]);
  const router = useTransitionRouter()
  const stateLembaga = useProxy(infoSekolahPaud.lembagaPendidikan);
  const stateSiswa = useProxy(infoSekolahPaud.siswa);
  const statePengajar = useProxy(infoSekolahPaud.pengajar);
  const loadData = async () => {
    try {
      // Load lembaga data
      await stateLembaga.findMany.load(1, 1, '');
      const totalLembaga = stateLembaga.findMany.total || 0;

      // Load siswa data
      await stateSiswa.findMany.load(1, 1, '');
      const totalSiswa = stateSiswa.findMany.total || 0;

      // Load pengajar data
      await statePengajar.findMany.load(1, 1, '');
      const totalPengajar = statePengajar.findMany.total || 0;

      setStats([
        {
          icon: IconChalkboard,
          jumlah: totalLembaga,
          nama: 'Lembaga Pendidikan',
          helper: 'Jumlah institusi pendidikan resmi di wilayah ini',
          loading: false,
        },
        {
          icon: IconSchool,
          jumlah: totalSiswa,
          nama: 'Siswa Terdaftar',
          helper: 'Total siswa aktif di semua jenjang',
          loading: false,
        },
        {
          icon: IconMicroscope,
          jumlah: totalPengajar,
          nama: 'Tenaga Pengajar',
          helper: 'Jumlah guru dan staf pengajar aktif',
          loading: false,
        },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set error state or show toast notification
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setStats(prev => prev.map(stat => ({ ...stat, loading: true })));
    loadData();
  };
  const [query] = useState('');
  
  const filtered = stats.filter((d) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const teks = `${d.nama} ${d.jumlah}`.toLowerCase();
    return teks.includes(q);
  });

  return (
    <Paper radius="md" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 48 }}>
      <Container size="xl" py={{ base: 'md', md: 'xl' }}>
        <Box>
          <Group justify="start" mb="md">
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="outline"
              size="xs"
              onClick={handleRefresh}
              loading={stats.some(stat => stat.loading)}
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
                  <Text fz="lg" fw={800} c="#2563eb">
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
                            color: '#2563eb',
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
                            <Text ta={"center"} fz="sm" fw={700} c="#2563eb">
                              {v.nama}
                            </Text>
                            <Tooltip label={v.helper ?? ''} position="right" withArrow>
                              <ActionIcon aria-label={`Info ${v.nama}`} variant="transparent" size="xs">
                                <IconInfoCircle size={16} style={{ color: '#2563eb' }} />
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
                          borderColor: '#e2e8f0',
                          color: '#2563eb',
                          paddingLeft: 20,
                          paddingRight: 20,
                        }}
                        onClick={() => {
                          if (v.nama === "Lembaga Pendidikan") router.push(`/darmasaba/pendidikan/info-sekolah/semua/lembaga`);
                          if (v.nama === "Siswa Terdaftar") router.push(`/darmasaba/pendidikan/info-sekolah/semua/siswa`);
                          if (v.nama === "Tenaga Pengajar") router.push(`/darmasaba/pendidikan/info-sekolah/semua/pengajar`);
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
    </Paper>
  );
}
