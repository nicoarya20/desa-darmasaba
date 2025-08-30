'use client'
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  VisuallyHidden
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

type LayoutSekolahProps = {
  title?: string;
  jenjangPendidikanList?: string[];
  children: React.ReactNode;
};

export default function LayoutSekolah({
  title = 'Cari Informasi Sekolah',
  jenjangPendidikanList = ['Semua', 'TK', 'SD', 'SMP', 'SMA'],
  children,
}: LayoutSekolahProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJenjangPendidikan = searchParams.get('jenjangPendidikan') || 'Semua';

  const [jenjangPendidikanAktif, setJenjangPendidikanAktif] = useState(initialJenjangPendidikan);

  // Cleanup timeout


  // Handle jenjang pendidikan click
  const handleJenjangPendidikanChange = (k: string) => {
    // arahkan langsung ke route jenjang pendidikan
    if (k.toLowerCase() === 'semua') {
      setJenjangPendidikanAktif(k);
      router.push(`/darmasaba/pendidikan/info-sekolah/semua`);
    } else {
      setJenjangPendidikanAktif(k);
      router.push(`/darmasaba/pendidikan/info-sekolah/${encodeURIComponent(k.toLowerCase())}`);
    }
  };
  

  return (
    <Box style={{ minHeight: '100vh', background: colors.Bg, paddingBottom: 48 }}>
      <Container size="xl" py={{ base: 'md', md: 'xl' }}>
        <Stack gap="lg">
          {/* Back Button */}
          <ActionIcon onClick={() => window.history.back()} variant="light" radius="md" size="lg">
            <IconArrowLeft size={20} />
            <VisuallyHidden>Kembali</VisuallyHidden>
          </ActionIcon>

          {/* Search & Filter */}
          <Paper radius="lg" p="xl" withBorder>
            <Stack gap="md">
              <Text ta="center" fw={800} fz={28}>{title}</Text>

              <Text ta="center" fz={"md"} c="black">
              Temukan data lengkap mengenai lembaga pendidikan, jumlah siswa terdaftar, dan tenaga pengajar berdasarkan jenjang pendidikan yang tersedia (TK, SD, SMP, SMA). Gunakan tombol di bawah untuk melihat detail sesuai kebutuhanmu.
              </Text>
              <Group justify="center" gap="xs" wrap="wrap">
                {jenjangPendidikanList.map((k) => {
                  const aktif = k === jenjangPendidikanAktif;
                  return (
                    <Button
                      key={k}
                      onClick={() => handleJenjangPendidikanChange(k)}
                      radius="xl"
                      size="sm"
                      variant={aktif ? 'filled' : 'light'}
                    >
                      {k}
                    </Button>
                  );
                })}
              </Group>
            </Stack>
          </Paper>

          {/* Slot konten */}
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
