'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Container, Grid, GridCol, Stack, Tabs, TabsList, TabsTab, Text } from '@mantine/core';
import BackButton from '../../layanan/_com/BackButto';
import dynamic from 'next/dynamic';
import type { SearchBarProps } from './searchBar';
import colors from '@/con/colors';

// Define tabs outside the component to ensure consistency between server and client
const TABS = [
  {
    label: "Foto",
    value: "foto",
    href: "/darmasaba/desa/galery/foto",
  },
  {
    label: "Video",
    value: "video",
    href: "/darmasaba/desa/galery/video",
  },
] as const;

const SearchBar = dynamic<SearchBarProps>(
  () => import('./searchBar').then(mod => mod.SearchBar),
  { ssr: false }
);

type HeaderSearchProps = {
  children?: React.ReactNode;
};

function LayoutTabsGalery({ children }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // Set default active tab to empty string to prevent hydration mismatch
  const [activeTab, setActiveTab] = useState('');

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update active tab based on current route - only on client side
  useEffect(() => {
    if (!isClient) return;
    
    const currentTab = TABS.find(tab => pathname.includes(tab.value));
    if (currentTab) {
      setActiveTab(currentTab.value);
    } else {
      // Default to first tab if no match found
      setActiveTab(TABS[0].value);
    }
  }, [pathname, isClient]);

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const tab = TABS.find(tab => tab.value === value);
    if (tab) {
      // Only update if we're on the client
      if (typeof window !== 'undefined') {
        setActiveTab(value);
        router.push(tab.href);
      }
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md">
        <Stack align="center" gap="0">
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Galeri Kegiatan Desa Darmasaba
          </Text>
        </Stack>
      </Container>

      <Tabs 
        value={isClient ? activeTab : undefined}
        defaultValue={TABS[0].value}
        onChange={handleTabChange}
        color={colors['blue-button']} 
        variant="pills"
        keepMounted={false}
      >
        <Box px={{ base: "md", md: 100 }} py="md" bg={colors['BG-trans']}>
          <Grid>
            <GridCol span={{ base: 12, md: 9, lg: 8, xl: 9 }}>
              <TabsList>
                {TABS.map((tab) => (
                  <TabsTab 
                    key={tab.value} 
                    value={tab.value}
                    component="button"
                    type="button"
                  >
                    {tab.label}
                  </TabsTab>
                ))}
              </TabsList>
            </GridCol>
            <GridCol span={{ base: 12, md: 3, lg: 4, xl: 3 }}>
              <SearchBar />
            </GridCol>
          </Grid>
        </Box>

        <Container size={'xl'}>
          {children}
        </Container>
      </Tabs>
    </Stack>
  );
}

export default LayoutTabsGalery;