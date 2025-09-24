'use client'
import colors from '@/con/colors';
import { Box, Group, Stack, Tabs, TabsList, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import BackButton from '../../layanan/_com/BackButto';

type HeaderSearchProps = {
  placeholder?: string;
  searchIcon?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
};

function LayoutTabsBerita({
  children,
  placeholder = "pencarian",
  searchIcon = <IconSearch size={20} />
}: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = pathname.split('/').pop() || 'semua';
  const initialSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const [activeTabState, setActiveTabState] = useState(activeTab);
  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (searchTimeout !== null) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (searchTimeout !== null) clearTimeout(searchTimeout);

    const newTimeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) params.set('search', value);
      else params.delete('search');

      if (params.toString() !== searchParams.toString()) {
        router.push(`/darmasaba/desa/berita/${activeTab}?${params.toString()}`);
      }
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const tabs = [
    { label: "Semua", value: "semua", href: "/darmasaba/desa/berita/semua" },
    { label: "Budaya", value: "budaya", href: "/darmasaba/desa/berita/budaya" },
    { label: "Pemerintahan", value: "pemerintahan", href: "/darmasaba/desa/berita/pemerintahan" },
    { label: "Ekonomi", value: "ekonomi", href: "/darmasaba/desa/berita/ekonomi" },
    { label: "Pembangunan", value: "pembangunan", href: "/darmasaba/desa/berita/pembangunan" },
    { label: "Sosial", value: "sosial", href: "/darmasaba/desa/berita/sosial" },
    { label: "Teknologi", value: "teknologi", href: "/darmasaba/desa/berita/teknologi" },
  ];

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const tab = tabs.find(t => t.value === value);
    if (tab) {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/darmasaba/desa/berita/${value}${params.toString() ? `?${params.toString()}` : ''}`);
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
            <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" >
              Portal Berita Darmasaba
            </Text>
            <Text>
              Temukan berbagai potensi dan keunggulan yang dimiliki Desa Darmasaba
            </Text>
          </Stack>
          <Box>
            <TextInput
              radius="lg"
              placeholder={placeholder}
              leftSection={searchIcon}
              w="100%"
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
        <Box px={{ base: "md", md: 100 }} py="md" bg={colors['BG-trans']}>
          {/* SCROLLABLE TABS */}
          <Box style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <TabsList style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.5rem' }}>
              {tabs.map((tab, index) => (
                <TabsTab
                  key={index}
                  value={tab.value}
                  onClick={() => router.push(tab.href)}
                  style={{
                    flex: '0 0 auto', // Prevent shrinking
                    minWidth: 100, // optional: makes them touch-friendly
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

export default LayoutTabsBerita;
