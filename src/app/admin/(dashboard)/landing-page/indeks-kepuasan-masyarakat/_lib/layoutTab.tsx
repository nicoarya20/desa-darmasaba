/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { IconChartBar, IconUsers } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

function LayoutTabsKepuasan({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = [
    {
      label: "Grafik Kepuasan",
      description: "Lihat visualisasi grafik kepuasan masyarakat",
      value: "grafik",
      href: "/admin/landing-page/indeks-kepuasan-masyarakat/grafik-kepuasan-masyarakat",
      icon: <IconChartBar size={18} stroke={1.8} />
    },
    {
      label: "Responden",
      description: "Kelola dan tinjau data responden",
      value: "responden",
      href: "/admin/landing-page/indeks-kepuasan-masyarakat/responden",
      icon: <IconUsers size={18} stroke={1.8} />
    },
  ];

  const curentTab = tabs.find(tab => tab.href === pathname);
  const [activeTab, setActiveTab] = useState<string | null>(curentTab?.value || tabs[0].value);

  const handleTabChange = (value: string | null) => {
    const tab = tabs.find(t => t.value === value);
    if (tab) router.push(tab.href);
    setActiveTab(value);
  };

  useEffect(() => {
    const match = tabs.find(tab => tab.href === pathname);
    if (match) setActiveTab(match.value);
  }, [pathname]);

  return (
    <Stack gap="lg">
      <Title order={2} style={{ fontWeight: 700, color: "#1a1a1a" }}>
        Indeks Kepuasan Masyarakat
      </Title>
      <Tabs
        color={colors["blue-button"]}
        variant="pills"
        value={activeTab}
        onChange={handleTabChange}
        radius="lg"
        keepMounted={false}
      >

        {/* ✅ Scroll horizontal wrapper */}
        <Box>
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
                paddingInline: "0.5rem", // ✅ biar nggak nempel ke tepi
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
                    flexShrink: 0, // ✅ jangan mengecil aneh-aneh
                  }}
                >
                  {tab.label}
                </TabsTab>
              ))}
            </TabsList>
          </ScrollArea>
        </Box>

        {tabs.map((e, i) => (
          <TabsPanel key={i} value={e.value}>
            <></>
          </TabsPanel>
        ))}
      </Tabs>
      {children}
    </Stack>
  );
}

export default LayoutTabsKepuasan;
