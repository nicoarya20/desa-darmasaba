/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { IconListDetails, IconUsers } from '@tabler/icons-react';

function LayoutTabsKolaborasi({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: "List Kolaborasi Inovasi",
      value: "listkolaborasiinovasi",
      href: "/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi",
      tooltip: "Lihat daftar kolaborasi inovasi",
      icon: <IconListDetails size={18} stroke={1.8} />,
    },
    {
      label: "Mitra Kolaborasi",
      value: "mitarakolaborasi",
      href: "/admin/inovasi/kolaborasi-inovasi/mitra-kolaborasi",
      tooltip: "Kelola mitra kolaborasi",
      icon: <IconUsers size={18} stroke={1.8} />,
    }
  ];

  const currentTab = tabs.find(tab => tab.href === pathname);
  const [activeTab, setActiveTab] = useState<string | null>(currentTab?.value || tabs[0].value);

  const handleTabChange = (value: string | null) => {
    const tab = tabs.find(t => t.value === value);
    if (tab) {
      router.push(tab.href);
    }
    setActiveTab(value);
  };

  useEffect(() => {
    const match = tabs.find(tab => tab.href === pathname);
    if (match) {
      setActiveTab(match.value);
    }
  }, [pathname]);

  return (
    <Stack gap="lg">
      <Title order={2} fw={700} style={{ color: "#1A1B1E" }}>
        Kolaborasi Inovasi
      </Title>
      <Tabs
        color={colors["blue-button"]}
        variant="pills"
        value={activeTab}
        onChange={handleTabChange}
        radius="lg"
        keepMounted={false}
      >
        {/* ✅ Scroll horizontal wrapper biar rapi */}
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
              <Tooltip
                key={i}
                label={tab.tooltip}
                position="bottom"
                withArrow
                transitionProps={{ transition: 'pop', duration: 200 }}
              >
                <TabsTab
                  value={tab.value}
                  leftSection={tab.icon}
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label}
                </TabsTab>
              </Tooltip>
            ))}
          </TabsList>
        </ScrollArea>

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

export default LayoutTabsKolaborasi;
