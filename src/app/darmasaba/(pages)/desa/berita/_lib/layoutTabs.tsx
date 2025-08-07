/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Container, Grid, GridCol, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
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
  searchIcon = <IconSearch size={20} />,
  value,
  onChange }: HeaderSearchProps) {

  const router = useRouter()
  const pathname = usePathname()
  const tabs = [
    {
      label: "Semua",
      value: "semua",
      href: "/darmasaba/desa/berita/semua"
    },
    {
      label: "Budaya",
      value: "budaya",
      href: "/darmasaba/desa/berita/budaya"
    },
    {
      label: "Pemerintahan",
      value: "pemerintahan",
      href: "/darmasaba/desa/berita/pemerintahan"
    },
    {
      label: "Ekonomi",
      value: "ekonomi",
      href: "/darmasaba/desa/berita/ekonomi"
    },
    {
      label: "Pembangunan",
      value: "pembangunan",
      href: "/darmasaba/desa/berita/pembangunan"
    },
    {
      label: "Sosial",
      value: "sosial",
      href: "/darmasaba/desa/berita/sosial"
    },
    {
      label: "Teknologi",
      value: "teknologi",
      href: "/darmasaba/desa/berita/teknologi"
    },

  ];
  const curentTab = tabs.find(tab => tab.href === pathname)
  const [activeTab, setActiveTab] = useState<string | null>(curentTab?.value || tabs[0].value);

  const handleTabChange = (value: string | null) => {
    const tab = tabs.find(t => t.value === value)
    if (tab) {
      router.push(tab.href)
    }
    setActiveTab(value)
  }

  useEffect(() => {
    const match = tabs.find(tab => tab.href === pathname)
    if (match) {
      setActiveTab(match.value)
    }
  }, [pathname])

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
    {/* Header */}
    <Box px={{ base: "md", md: 100 }}>
      <BackButton />
    </Box>
    <Container size="lg" px="md">
      <Stack align="center" gap="0" >
        <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
          Portal Berita Darmasaba
        </Text>
        <Text ta="center" px="md">
          Temukan berbagai potensi dan keunggulan yang dimiliki Desa Darmasaba
        </Text>
      </Stack>
    </Container>
      <Tabs color={colors['blue-button']} variant="pills" defaultValue="semua" value={activeTab} onChange={handleTabChange}>
        <Box px={{ base: "md", md: 100 }} py="md" bg={colors['BG-trans']} >
          <Grid>
            <GridCol span={{ base: 12, md: 9, lg: 8, xl: 9 }}>
              <TabsList>
                {tabs.map((e, i) => (
                  <TabsTab key={i} value={e.value}>{e.label}</TabsTab>
                ))}
              </TabsList>
            </GridCol>
            <GridCol span={{ base: 12, md: 3, lg: 4, xl: 3 }}>
                <TextInput
                  radius="lg"
                  placeholder={placeholder}
                  leftSection={searchIcon}
                  w="100%"
                  value={value}
                  onChange={onChange}
                />
            </GridCol>
          </Grid>
        </Box>
        {tabs.map((e, i) => (
          <TabsPanel key={i} value={e.value}>
            {/* Konten dummy, bisa diganti tergantung routing */}
            <></>
          </TabsPanel>
        ))}
      </Tabs>
      {children}
    </Stack>
  );
}

export default LayoutTabsBerita;