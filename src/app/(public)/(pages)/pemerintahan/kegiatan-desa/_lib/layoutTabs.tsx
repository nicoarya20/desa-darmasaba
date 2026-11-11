/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

function LayoutTabsKegiatanDesa({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kategoriState = useProxy(stateDashboardKegiatan.kategoriKegiatan);

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);

  useEffect(() => {
    kategoriState.findMany.load(1, 100);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    params.delete('page');
    router.push(`/pemerintahan/kegiatan-desa/semua?${params.toString()}`);
  }, [debouncedSearch]);

  const handleKategoriChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('kategori', value);
    else params.delete('kategori');
    params.delete('page');
    router.push(`/pemerintahan/kegiatan-desa/semua?${params.toString()}`);
  };

  const kategoriOptions = Array.from(
    new Map(
      (kategoriState.findMany.data || []).map((k: any) => [k.nama, { value: k.nama, label: k.nama }])
    ).values()
  );

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Text fz={{ base: '2rem', md: '3.4rem' }} c={colors['blue-button']} fw="bold" lh={1.2}>
              Kegiatan Desa Darmasaba
            </Text>
            <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
              Temukan berbagai kegiatan dan program yang dilaksanakan Desa Darmasaba
            </Text>
          </Stack>

          <Group gap="sm" wrap="nowrap" align="center">
            <Select
              radius="lg"
              placeholder="Semua Kategori"
              data={kategoriOptions}
              value={searchParams.get('kategori') || null}
              onChange={handleKategoriChange}
              clearable
              w={180}
            />
            <TextInput
              radius="lg"
              placeholder="Cari kegiatan..."
              leftSection={<IconSearch size={18} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              w={220}
            />
          </Group>
        </Group>
      </Box>

      {children}
    </Stack>
  );
}

export default LayoutTabsKegiatanDesa;
