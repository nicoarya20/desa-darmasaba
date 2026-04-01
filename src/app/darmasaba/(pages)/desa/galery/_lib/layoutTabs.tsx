'use client';

import colors from '@/con/colors';
import { Box, Container, Stack, Tabs, TabsList, TabsTab, Text } from '@mantine/core';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '../../layanan/_com/BackButto';
import type { SearchBarProps } from './searchBar';

// ✅ Definisikan tabs di luar komponen (statis, aman untuk SSR)
const TABS = [
  { label: 'Foto', value: 'foto', href: '/darmasaba/desa/galery/foto' },
  { label: 'Video', value: 'video', href: '/darmasaba/desa/galery/video' },
] as const;

const SearchBar = dynamic<SearchBarProps>(
  () => import('./searchBar').then((mod) => mod.SearchBar),
  { ssr: false }
);

type LayoutTabsGaleryProps = {
  children?: React.ReactNode;
};

export default function LayoutTabsGalery({ children }: LayoutTabsGaleryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].value);

  // 🧠 Update tab aktif berdasarkan URL
  useEffect(() => {
    const found = TABS.find((tab) => pathname.includes(tab.value));
    if (found) setActiveTab(found.value);
    else setActiveTab(TABS[0].value);
  }, [pathname]);

  // 🖱️ Handle perubahan tab
  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const selected = TABS.find((tab) => tab.value === value);
    if (selected) {
      setActiveTab(selected.value);
      router.push(selected.href);
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      {/* 🔙 Header */}
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* 🏷️ Title & Search */}
      <Box px={{ base: 'md', md: 100 }}>
        <Stack align="center" gap="0">
          <Text
            fz={{ base: '2rem', md: '3.4rem' }}
            c={colors['blue-button']}
            fw="bold"
            ta="center"
          >
            Galeri Kegiatan Desa Darmasaba
          </Text>
        </Stack>
        <Box>
          <SearchBar />
        </Box>
      </Box>

      {/* 🗂️ Tabs Section */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        color={colors['blue-button']}
        variant="pills"
        keepMounted={false}
      >
        <Box px={{ base: 'md', md: 100 }} py="md" bg={colors['BG-trans']}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTab key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTab>
            ))}
          </TabsList>
        </Box>

        <Container size="xl">{children}</Container>
      </Tabs>
    </Stack>
  );
}
