/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { IconBuilding, IconChalkboard, IconMicroscope, IconSchool } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: "Jenjang Pendidikan",
      value: "jenjangPendidikan",
      href: "/admin/pendidikan/info-sekolah/jenjang-pendidikan",
      icon: <IconBuilding size={18} stroke={1.8} />,
      tooltip: "Lihat dan kelola jenjang pendidikan",
    },
    {
      label: "Lembaga",
      value: "lembaga",
      href: "/admin/pendidikan/info-sekolah/lembaga",
      icon: <IconChalkboard size={18} stroke={1.8} />,
      tooltip: "Lihat dan kelola lembaga",
    },
    {
      label: "Siswa",
      value: "siswa",
      href: "/admin/pendidikan/info-sekolah/siswa",
      icon: <IconSchool size={18} stroke={1.8} />,
      tooltip: "Lihat dan kelola siswa",
    },
    {
      label: "Pengajar",
      value: "pengajar",
      href: "/admin/pendidikan/info-sekolah/pengajar",
      icon: <IconMicroscope size={18} stroke={1.8} />,
      tooltip: "Lihat dan kelola pengajar",
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
        Info Sekolah
      </Title>
      <Tabs
        color={colors['blue-button']}
        variant='pills'
        value={activeTab}
        onChange={handleTabChange}
        radius="lg"
        keepMounted={false}
      >
        <ScrollArea type="auto" offsetScrollbars>
          <TabsList
            p="sm"
            style={{
              background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
              borderRadius: "1rem",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
            }}
          >
            {tabs.map((tab, i) => (
              <Tooltip key={i} label={tab.tooltip} position="bottom" withArrow transitionProps={{ transition: 'pop', duration: 200 }}>
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
              minHeight: "60vh",
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




