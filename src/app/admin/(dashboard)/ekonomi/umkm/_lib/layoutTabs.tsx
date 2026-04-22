/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  ScrollArea,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Title
} from '@mantine/core';
import { IconDashboard, IconBuildingStore, IconPackage, IconShoppingCart, IconCategory } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: "Dashboard",
      value: "dashboard",
      href: "/admin/ekonomi/umkm/dashboard",
      icon: <IconDashboard size={18} stroke={1.8} />
    },
    {
      label: "Data UMKM",
      value: "data-umkm",
      href: "/admin/ekonomi/umkm/data-umkm",
      icon: <IconBuildingStore size={18} stroke={1.8} />
    },
    {
      label: "Produk",
      value: "produk",
      href: "/admin/ekonomi/umkm/produk",
      icon: <IconPackage size={18} stroke={1.8} />
    },
    {
      label: "Penjualan",
      value: "penjualan",
      href: "/admin/ekonomi/umkm/penjualan",
      icon: <IconShoppingCart size={18} stroke={1.8} />
    },
    {
      label: "Kategori Produk",
      value: "kategori-produk",
      href: "/admin/ekonomi/umkm/kategori-produk",
      icon: <IconCategory size={18} stroke={1.8} />
    }
  ];

  const currentTab = tabs.find((tab) => pathname.startsWith(tab.href));
  const [activeTab, setActiveTab] = useState<string | null>(
    currentTab?.value || tabs[0].value
  );

  const handleTabChange = (value: string | null) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab) {
      router.push(tab.href);
    }
    setActiveTab(value);
  };

  useEffect(() => {
    const match = tabs.find((tab) => pathname.startsWith(tab.href));
    if (match) {
      setActiveTab(match.value);
    }
  }, [pathname]);

  return (
    <Stack gap="lg">
      <Title order={2} fw={700} style={{ color: "#1A1B1E" }}>
        Manajemen UMKM
      </Title>

      <Tabs
        color={colors['blue-button']}
        variant="pills"
        value={activeTab}
        onChange={handleTabChange}
        radius="lg"
        keepMounted={false}
      >
        <Box visibleFrom='md' pb={10}>
          <ScrollArea type="auto" offsetScrollbars>
            <TabsList
              p="sm"
              style={{
                background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
                borderRadius: "1rem",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                display: "flex",
                flexWrap: "nowrap",
                gap: "0.5rem",
                paddingInline: "0.5rem",
              }}
            >
              {tabs.map((tab, i) => (
                <TabsTab
                  key={i}
                  value={tab.value}
                  leftSection={tab.icon}
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {tab.label}
                </TabsTab>
              ))}
            </TabsList>
          </ScrollArea>
        </Box>

        <Box hiddenFrom='md' pb={10}>
          <ScrollArea type="auto" offsetScrollbars={false} w="100%">
            <TabsList
              p="xs"
              style={{
                background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
                borderRadius: "1rem",
                display: "flex",
                flexWrap: "nowrap",
                gap: "0.5rem",
                width: "max-content",
                maxWidth: "100%",
              }}
            >
              {tabs.map((tab, i) => (
                <TabsTab
                  key={i}
                  value={tab.value}
                  leftSection={tab.icon}
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    paddingInline: "0.75rem",
                    flexShrink: 0,
                  }}
                >
                  {tab.label}
                </TabsTab>
              ))}
            </TabsList>
          </ScrollArea>
        </Box>

        {tabs.map((tab, i) => (
          <TabsPanel
            key={i}
            value={tab.value}
            style={{
              padding: "1.5rem",
              background: "linear-gradient(180deg, #ffffff, #f5f6fa)",
              borderRadius: "1rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
            }}
          >
            {children}
          </TabsPanel>
        ))}
      </Tabs>
    </Stack>
  );
}

export default LayoutTabs;
