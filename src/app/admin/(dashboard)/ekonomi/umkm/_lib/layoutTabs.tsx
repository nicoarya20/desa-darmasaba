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
import { IconDashboard, IconBuildingStore, IconPackage, IconShoppingCart, IconTag } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { shouldShowUmkmTabBar, visibleUmkmTabs, type UmkmTab, type UmkmTabValue } from './umkm-tabs.logic';

const TAB_ICONS: Record<UmkmTabValue, React.ReactNode> = {
  "dashboard": <IconDashboard size={18} stroke={1.8} />,
  "data-umkm": <IconBuildingStore size={18} stroke={1.8} />,
  "produk": <IconPackage size={18} stroke={1.8} />,
  "penjualan": <IconShoppingCart size={18} stroke={1.8} />,
  "kategori-produk": <IconTag size={18} stroke={1.8} />,
};

// Dihitung sekali di level modul supaya referensinya stabil untuk dependency useEffect.
const VISIBLE_TABS = visibleUmkmTabs();

const PANEL_STYLE: React.CSSProperties = {
  padding: "1.5rem",
  background: "linear-gradient(180deg, #ffffff, #f5f6fa)",
  borderRadius: "1rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

function UmkmTabbed({ tabs, children }: { tabs: UmkmTab[]; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
  }, [pathname, tabs]);

  return (
    <Tabs
      color={colors['blue-button']}
      variant="pills"
      value={activeTab}
      onChange={handleTabChange}
      radius="lg"
      keepMounted={false}
    >
      <Box visibleFrom='md' pb={10}>
        <ScrollArea type="hover" offsetScrollbars>
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
                leftSection={TAB_ICONS[tab.value]}
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
        <ScrollArea type="hover" offsetScrollbars={false} w="100%">
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
                leftSection={TAB_ICONS[tab.value]}
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
        <TabsPanel key={i} value={tab.value} style={PANEL_STYLE}>
          {children}
        </TabsPanel>
      ))}
    </Tabs>
  );
}

/** Kerangka halaman admin UMKM: judul + bar tab (hanya bila tab tampil lebih dari satu) + konten. */
function LayoutTabs({ children }: { children: React.ReactNode }) {
  const tabs = VISIBLE_TABS;

  return (
    <Stack gap="lg">
      <Title order={2} fw={700} style={{ color: "#1A1B1E" }}>
        Manajemen UMKM
      </Title>

      {shouldShowUmkmTabBar(tabs) ? (
        <UmkmTabbed tabs={tabs}>{children}</UmkmTabbed>
      ) : (
        <Box style={PANEL_STYLE}>{children}</Box>
      )}
    </Stack>
  );
}

export default LayoutTabs;
