'use client'
import { useEffect, useState } from 'react';
import { ActionIcon, Box, Flex, Grid, GridCol, Stack, Tabs, TabsList, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import BackButton from '../../../desa/layanan/_com/BackButto';
import colors from '@/con/colors';

type LayoutBukuProps = {
  placeholder?: string;
  searchIcon?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
};

function LayoutTabs({
  placeholder = 'Cari buku digital...',
  searchIcon = <IconSearch size={20} />,
  children,
}: LayoutBukuProps) {
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

    const updateSearch = () => {
      const params = new URLSearchParams();
      if (value) params.set('search', value);

      router.push(
        `/darmasaba/pendidikan/perpustakaan-digital/${activeTab}${params.toString() ? `?${params.toString()}` : ''}`
      );
    };

    if (value === '') {
      updateSearch();
    } else {
      const newTimeout = window.setTimeout(updateSearch, 350);
      setSearchTimeout(newTimeout);
    }
  };

  const tabs = [
    { label: 'Semua', value: 'semua', href: '/darmasaba/pendidikan/perpustakaan-digital/semua' },
    { label: 'Dokumenter', value: 'dokumenter', href: '/darmasaba/pendidikan/perpustakaan-digital/dokumenter' },
    { label: 'Sayuran', value: 'sayuran', href: '/darmasaba/pendidikan/perpustakaan-digital/sayuran' },
    { label: 'Dongeng', value: 'dongeng', href: '/darmasaba/pendidikan/perpustakaan-digital/dongeng' },
  ];

  const handleTabChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/darmasaba/pendidikan/perpustakaan-digital/${value}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <Stack pos="relative" bg="var(--mantine-color-gray-0)" py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <Flex justify="space-between" align="center">
          <BackButton />
          <ActionIcon
            variant="light"
            component={Link}
            href="/login"
            radius="xl"
            size="lg"
            aria-label="Masuk ke akun"
          >
            <IconUser size={26} stroke={1.5} />
          </ActionIcon>
        </Flex>
      </Box>

      <Box pb={20}>
        <Text ta="center" fz={{ base: '1.6rem', md: '2.4rem' }} fw={700} c={colors['blue-button']}>
          Perpustakaan Digital Darmasaba
        </Text>
        <Tabs color="blue" variant="pills" value={activeTabState} onChange={handleTabChange}>
          <Box px={{ base: 'md', md: 100 }} py="md" bg="var(--mantine-color-gray-1)" style={{ borderRadius: 16 }}>
            <Grid align="center" gutter="md">
              <GridCol span={{ base: 12, md: 9 }}>
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTab
                      color={colors['blue-button']}
                      key={tab.value}
                      value={tab.value}
                      onClick={() => router.push(tab.href)}
                      style={{ fontWeight: 500 }}
                    >
                      {tab.label}
                    </TabsTab>
                  ))}
                </TabsList>
              </GridCol>
              <GridCol span={{ base: 12, md: 3 }}>
                <TextInput
                  radius="xl"
                  size="md"
                  placeholder={placeholder}
                  leftSection={searchIcon}
                  w="100%"
                  value={searchValue}
                  onChange={handleSearchChange}
                  aria-label="Cari judul buku"
                />
              </GridCol>
            </Grid>
          </Box>
          {children}
        </Tabs>
      </Box>
    </Stack>
  );
}

export default LayoutTabs;
