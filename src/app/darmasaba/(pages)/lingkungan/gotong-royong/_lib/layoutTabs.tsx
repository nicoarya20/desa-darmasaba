/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';
import colors from '@/con/colors';
import { Box, Group, Stack, Tabs, TabsList, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function LayoutTabsGotongRoyong({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const kategoriState = useProxy(gotongRoyongState.kategoriKegiatan);

  // tab aktif dari url
  const activeTab = pathname.split('/').pop() || 'semua';
  const [activeTabState, setActiveTabState] = useState(activeTab);

  useEffect(() => {
    kategoriState.findMany.load(); // ambil kategori dari DB
  }, []);

  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  // search
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

      router.push(`/darmasaba/lingkungan/gotong-royong/${activeTab}${params.toString() ? `?${params.toString()}` : ''}`);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  // --- tabs dinamis ---
  const tabs = [
    { label: "Semua", value: "semua", href: "/darmasaba/lingkungan/gotong-royong/semua" },
    ...(kategoriState.findMany.data || []).map((kat: any) => ({
      label: kat.nama,
      value: kat.nama.toLowerCase(),
      href: `/darmasaba/lingkungan/gotong-royong/${kat.nama.toLowerCase()}`
    }))
  ];

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const tab = tabs.find(t => t.value === value);
    if (tab) {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`${tab.href}${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Group justify='space-between' align="center">
          <Stack gap="0">
            <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold">
              Portal Gotong royong Darmasaba
            </Text>
            <Text fz="md">Temukan berbagai kegiatan lingkungan yang dimiliki Desa Darmasaba</Text>
          </Stack>
          <Box>
            <TextInput
              radius="lg"
              placeholder="pencarian"
              leftSection={<IconSearch size={20} />}
              w="100%"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </Box>
        </Group>
      </Box>

      {/* TABS */}
      <Tabs
        color={colors['blue-button']}
        variant="pills"
        value={activeTabState}
        onChange={handleTabChange}
      >
        <Box px={{ base: "md", md: 100 }} py="md" bg={colors['BG-trans']}>
          <Box style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <TabsList style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.5rem' }}>
              {tabs.map((tab, index) => (
                <TabsTab
                  key={index}
                  value={tab.value}
                  onClick={() => router.push(tab.href)}
                  style={{
                    flex: '0 0 auto',
                    minWidth: 100,
                    textAlign: 'center'
                  }}
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

export default LayoutTabsGotongRoyong;
