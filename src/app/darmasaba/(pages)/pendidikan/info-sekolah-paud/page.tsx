/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
  VisuallyHidden,
} from '@mantine/core';
import {
  IconChalkboard,
  IconInfoCircle,
  IconMicroscope,
  IconSchool,
  IconSearch,
  IconArrowLeft,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { IconProps } from '@tabler/icons-react';

type Stat = {
  id: number;
  icon: React.ComponentType<IconProps>;
  jumlah: number;
  nama: string;
  helper?: string;
};

const dataSekolah: Stat[] = [
  {
    id: 1,
    icon: IconChalkboard,
    jumlah: 15,
    nama: 'Lembaga Pendidikan',
    helper: 'Jumlah institusi pendidikan resmi di wilayah ini',
  },
  {
    id: 2,
    icon: IconSchool,
    jumlah: 3209,
    nama: 'Siswa Terdaftar',
    helper: 'Total siswa aktif di semua jenjang',
  },
  {
    id: 3,
    icon: IconMicroscope,
    jumlah: 285,
    nama: 'Tenaga Pengajar',
    helper: 'Jumlah guru dan staf pengajar aktif',
  },
];

export default function SekolahPage() {
  const [query, setQuery] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const kategoriList = ['Semua', 'TK/PAUD', 'SD', 'SMP', 'SMA/SMK'];
  const maxJumlah = useMemo(() => Math.max(...dataSekolah.map((d) => d.jumlah)), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataSekolah.filter((d) => {
      const teks = `${d.nama} ${d.jumlah}`.toLowerCase();
      const matchQuery = q ? teks.includes(q) : true;
      return matchQuery;
    });
  }, [query, kategoriAktif]);

  const hasilCount = filtered.length;

  return (
    <Box style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 48 }}>
      <Container size="xl" py={{ base: 'md', md: 'xl' }}>
        <Stack gap="lg">
          <Box>
            <ActionIcon
              aria-label="Kembali"
              onClick={() => window.history.back()}
              size="lg"
              radius="md"
              variant="light"
              style={{
                color: '#1e293b',
                background: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <IconArrowLeft size={20} stroke={2} />
              <VisuallyHidden>Tombol kembali</VisuallyHidden>
            </ActionIcon>
          </Box>

          <Paper
            radius="lg"
            p={{ base: 'md', md: 'xl' }}
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            }}
            role="search"
            aria-label="Pencarian sekolah"
          >
            <Stack gap="md">
              <Center>
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <Text
                    ta="center"
                    c="#0f172a"
                    fz={{ base: 22, md: 30 }}
                    fw={800}
                    style={{ letterSpacing: -0.3 }}
                  >
                    Cari Informasi Sekolah
                  </Text>
                  <Text ta="center" c="dimmed" fz="sm" mt={6}>
                    Masukkan nama, jenjang, atau alamat sekolah untuk hasil lebih spesifik.
                  </Text>
                </motion.div>
              </Center>

              <Group align="center" justify="center" gap="sm" style={{ width: '100%' }}>
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  placeholder="Contoh: SMP Negeri, SD 01, Kelurahan..."
                  leftSection={<IconSearch size={18} aria-hidden />}
                  aria-label="Masukkan kata kunci pencarian"
                  radius="xl"
                  size="md"
                  rightSection={
                    <Button
                      radius="xl"
                      size="sm"
                      aria-label="Telusuri"
                      onClick={() => {}}
                      style={{
                        height: 38,
                        minWidth: 110,
                        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                      }}
                    >
                      Telusuri
                    </Button>
                  }
                  rightSectionWidth={120}
                  style={{
                    width: '100%',
                    maxWidth: 920,
                  }}
                />
              </Group>

              <Group justify="center" gap="xs" wrap="wrap" style={{ marginTop: 4 }}>
                {kategoriList.map((k) => {
                  const aktif = k === kategoriAktif;
                  return (
                    <motion.div
                      key={k}
                      initial={{ scale: 0.98, opacity: 0.9 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Button
                        onClick={() => setKategoriAktif(k)}
                        radius="xl"
                        size="sm"
                        variant={aktif ? 'filled' : 'light'}
                        style={{
                          background: aktif
                            ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                            : 'white',
                          color: aktif ? 'white' : '#2563eb',
                          boxShadow: aktif ? '0 4px 16px rgba(59,130,246,0.25)' : 'none',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {k}
                      </Button>
                    </motion.div>
                  );
                })}
              </Group>
            </Stack>
          </Paper>

          <Box aria-live="polite" aria-atomic>
            <Text fz="sm" c="dimmed">
              Menampilkan <Text component="span" c="#0f172a" fw={700}>{hasilCount}</Text> hasil.
            </Text>
          </Box>

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
                    onClick={() => {
                      setQuery('');
                      setKategoriAktif('Semua');
                    }}
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
              filtered.map((v) => {
                const percent = Math.round((v.jumlah / maxJumlah) * 100) || 0;
                return (
                  <motion.div
                    key={v.id}
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.995 }}
                    style={{ width: '100%' }}
                  >
                    <Paper
                      p="lg"
                      radius="lg"
                      style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
                        minHeight: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      role="article"
                      aria-label={`${v.nama} kartu statistik`}
                    >
                      <Stack gap="sm">
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

                        <Group justify="apart" align="center" gap="xs">
                          <Stack gap={0}>
                            <Text fz={{ base: 18, md: 22 }} fw={800} c="#0f172a">
                              {v.jumlah.toLocaleString()}
                            </Text>
                            <Group gap={6} align="center">
                              <Text fz="sm" fw={700} c="#2563eb">
                                {v.nama}
                              </Text>
                              <Tooltip label={v.helper ?? ''} position="right" withArrow>
                                <ActionIcon aria-label={`Info ${v.nama}`} variant="transparent" size="xs">
                                  <IconInfoCircle size={16} style={{ color: '#2563eb' }} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Stack>

                          <Badge
                            radius="md"
                            variant="light"
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            Statistik
                          </Badge>
                        </Group>

                        <Box>
                          <Progress
                            value={percent}
                            size="sm"
                            radius="xl"
                            aria-label={`${v.nama} progres ${percent} persen`}
                          />
                          <Text fz="xs" c="dimmed" mt="6px">
                            Perbandingan dengan jumlah terbesar.
                          </Text>
                        </Box>
                      </Stack>

                      <Group justify="right" mt="8px">
                        <Button
                          radius="xl"
                          variant="outline"
                          onClick={() => {}}
                          aria-label={`Lihat detail ${v.nama}`}
                          style={{
                            borderColor: '#e2e8f0',
                            color: '#2563eb',
                            paddingLeft: 20,
                            paddingRight: 20,
                          }}
                        >
                          Lihat Detail
                        </Button>
                      </Group>
                    </Paper>
                  </motion.div>
                );
              })
            )}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
