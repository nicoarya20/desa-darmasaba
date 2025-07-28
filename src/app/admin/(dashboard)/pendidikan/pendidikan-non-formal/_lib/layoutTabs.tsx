/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const tabs = [
    {
      label: "Tujuan Program",
      value: "tujuan-program",
      href: "/admin/pendidikan/pendidikan-non-formal/tujuan-program"
    },
    {
      label: "Tempat Kegiatan",
      value: "tempat-kegiatan",
      href: "/admin/pendidikan/pendidikan-non-formal/tempat-kegiatan"
    },
    {
      label: "Jenis Program yang Diselenggarakan",
      value: "jenis-program-yang-diselenggarakan",
      href: "/admin/pendidikan/pendidikan-non-formal/jenis-program-yang-diselenggarakan"
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
    <Stack>
      <Title order={3}>Pendidikan Non Formal</Title>
      <Tabs color={colors['blue-button']} variant='pills' value={activeTab} onChange={handleTabChange}>
        <TabsList p={"xs"} bg={"#BBC8E7FF"}>
          {tabs.map((e, i) => (
            <TabsTab key={i} value={e.value}>{e.label}</TabsTab>
          ))}
        </TabsList>
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

export default LayoutTabs;