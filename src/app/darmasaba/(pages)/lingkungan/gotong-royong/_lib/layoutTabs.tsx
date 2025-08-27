'use client'
import colors from '@/con/colors';
import { Box, Container, Grid, GridCol, Stack, Tabs, TabsList, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import BackButton from '../../../desa/layanan/_com/BackButto';


type HeaderSearchProps = {
  placeholder?: string;
  searchIcon?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
};

function LayoutTabsGotongRoyong({
  children,
  placeholder = "pencarian",
  searchIcon = <IconSearch size={20} />
}: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get active tab from URL path
  const activeTab = pathname.split('/').pop() || 'semua';
  
  // Get initial search value from URL
  const initialSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  
  // Update active tab state when pathname changes
  const [activeTabState, setActiveTabState] = useState(activeTab);
  useEffect(() => {
    setActiveTabState(activeTab);
  }, [activeTab]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout !== null) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle search input change with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    
    // Clear previous timeout
    if (searchTimeout !== null) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout
    const newTimeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      
      // Only update URL if the search value has actually changed
      if (params.toString() !== searchParams.toString()) {
        router.push(`/darmasaba/lingkungan/gotong-royong/${activeTab}?${params.toString()}`);
      }
    }, 500); // 500ms debounce delay
    
    setSearchTimeout(newTimeout);
  };
  const tabs = [
    {
      label: "Semua",
      value: "semua",
      href: "/darmasaba/lingkungan/gotong-royong/semua"
    },
    {
      label: "Kebersihan",
      value: "kebersihan",
      href: "/darmasaba/lingkungan/gotong-royong/kebersihan"
    },
    {
      label: "Infrasturktur",
      value: "infrasturktur",
      href: "/darmasaba/lingkungan/gotong-royong/infrasturktur"
    },
    {
      label: "Sosial",
      value: "sosial",
      href: "/darmasaba/lingkungan/gotong-royong/sosial"
    },
    {
      label: "Lingkungan",
      value: "lingkungan",
      href: "/darmasaba/lingkungan/gotong-royong/lingkungan"
    }
  ];
  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const tab = tabs.find(t => t.value === value);
    if (tab) {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/darmasaba/lingkungan/gotong-royong/${value}${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md">
        <Stack align="center" gap="0" >
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            Gotong Royong Desa Darmasaba
          </Text>
          <Text ta="center" px="md">
            Gotong royong rutin dilakukan oleh warga desa untuk meningkatkan kualitas hidup dan kesejahteraan masyarakat Desa Darmasaba
          </Text>
        </Stack>
      </Container>

      <Tabs
        color={colors['blue-button']}
        variant="pills"
        value={activeTabState}
        onChange={handleTabChange}
      >
        <Box px={{ base: "md", md: 100 }} py="md" bg={colors['BG-trans']}>
          <Grid>
            <GridCol span={{ base: 12, md: 9, lg: 8, xl: 9 }}>
              <TabsList>
                {tabs.map((tab, index) => (
                  <TabsTab
                    key={index}
                    value={tab.value}
                    onClick={() => router.push(tab.href)}
                  >
                    {tab.label}
                  </TabsTab>
                ))}
              </TabsList>
            </GridCol>
            <GridCol span={{ base: 12, md: 3, lg: 4, xl: 3 }}>
              <TextInput
                radius="lg"
                placeholder={placeholder}
                leftSection={searchIcon}
                w="100%"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </GridCol>
          </Grid>
        </Box>

        {children}
      </Tabs>
    </Stack>
  );
}

export default LayoutTabsGotongRoyong;