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
  TextInput,
  VisuallyHidden,
} from '@mantine/core';
import { IconArrowLeft, IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

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
  const pathname = usePathname();

  const initialQuery = searchParams.get('search') || '';
  const initialJenjangPendidikan = searchParams.get('jenjangPendidikan') || 'Semua';

  const [query, setQuery] = useState(initialQuery);
  const [jenjangPendidikanAktif, setJenjangPendidikanAktif] = useState(initialJenjangPendidikan);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  // Handle Search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    setQuery(val);

    if (searchTimeout) clearTimeout(searchTimeout);
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) params.set('search', val);
      else params.delete('search');
      params.set('jenjangPendidikan', jenjangPendidikanAktif);
      router.push(`${pathname}?${params.toString()}`);
    }, 500);
    setSearchTimeout(t);
  };

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

              <TextInput
                value={query}
                onChange={handleSearchChange}
                placeholder="Cari sekolah..."
                leftSection={<IconSearch size={18} />}
                radius="xl"
                size="md"
              />

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
