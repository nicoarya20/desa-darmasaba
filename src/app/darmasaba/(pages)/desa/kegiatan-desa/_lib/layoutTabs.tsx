/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Group, Stack, Tabs, TabsList, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

function LayoutTabsKegiatanDesa({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const kategoriState = useProxy(stateDashboardKegiatan.kategoriKegiatan);
  const activeTab = pathname.split('/').pop() || 'semua';
  const [activeTabState, setActiveTabState] = useState(activeTab);

  useEffect(() => {
    kategoriState.findMany.load(1, 100);
  }, []);

  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  const initialSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (searchTimeout !== null) clearTimeout(searchTimeout);

    const newTimeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('search', value);
      else params.delete('search');

      router.push(
        `/darmasaba/desa/kegiatan-desa/${activeTab}${params.toString() ? `?${params.toString()}` : ''}`
      );
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const tabs = [
    { label: 'Semua', value: 'semua', href: '/darmasaba/desa/kegiatan-desa/semua' },
    ...(kategoriState.findMany.data || []).map((kat: any) => ({
      label: kat.nama,
      value: kat.nama.toLowerCase(),
      href: `/darmasaba/desa/kegiatan-desa/${kat.nama.toLowerCase()}`,
    })),
  ];

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const tab = tabs.find((t) => t.value === value);
    if (tab) {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`${tab.href}${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Text fz={{ base: '2rem', md: '3.4rem' }} c={colors['blue-button']} fw="bold" lh={1.2}>
              Kegiatan Desa Darmasaba
            </Text>
            <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
              Temukan berbagai kegiatan dan program yang dilaksanakan Desa Darmasaba
            </Text>
          </Stack>
          <Box w={{ base: '100%', sm: 260 }}>
            <TextInput
              radius="lg"
              placeholder="Cari kegiatan..."
              leftSection={<IconSearch size={18} />}
              value={searchValue}
              onChange={handleSearchChange}
            />
          </Box>
        </Group>
      </Box>

      <Tabs
        color={colors['blue-button']}
        variant="pills"
        value={activeTabState}
        onChange={handleTabChange}
      >
        <Box px={{ base: 'md', md: 100 }} py="md" bg={colors['BG-trans']}>
          <Box style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <TabsList style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.5rem' }}>
              {tabs.map((tab, i) => (
                <TabsTab
                  key={i}
                  value={tab.value}
                  onClick={() => router.push(tab.href)}
                  style={{ flex: '0 0 auto', minWidth: 100, textAlign: 'center' }}
                >
                  {tab.label}
                </TabsTab>
              ))}
            </TabsList>
          </Box>
        </Box>

        {children}
      </Tabs>
    </Stack>
  );
}

export default LayoutTabsKegiatanDesa;
