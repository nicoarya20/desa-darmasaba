/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  ScrollArea,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Title,
  Tooltip
} from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  IconFileText,
  IconListDetails,
  IconMessage,
  IconAlertCircle
} from '@tabler/icons-react';

function LayoutTabsLayananOnlineDesa({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Tambahin icon + tooltip biar konsisten sama versi berita
  const tabs = [
    {
      label: "Administrasi Online",
      value: "administrasionline",
      href: "/admin/inovasi/layanan-online-desa/administrasi-online",
      icon: <IconFileText size={18} stroke={1.8} />,
      tooltip: "Kelola administrasi online desa"
    },
    {
      label: "Jenis Layanan",
      value: "jenislayanan",
      href: "/admin/inovasi/layanan-online-desa/jenis-layanan",
      icon: <IconListDetails size={18} stroke={1.8} />,
      tooltip: "Daftar jenis layanan desa"
    },
    {
      label: "Pengaduan Masyarakat",
      value: "pengaduanmasyarakat",
      href: "/admin/inovasi/layanan-online-desa/pengaduan-masyarakat",
      icon: <IconMessage size={18} stroke={1.8} />,
      tooltip: "Laporan pengaduan masyarakat"
    },
    {
      label: "Jenis Pengaduan",
      value: "jenispengaduan",
      href: "/admin/inovasi/layanan-online-desa/jenis-pengaduan",
      icon: <IconAlertCircle size={18} stroke={1.8} />,
      tooltip: "Kategori/jenis pengaduan masyarakat"
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
      <Title order={3} fw={700} style={{ color: "#1A1B1E" }}>
        Layanan Online Desa
      </Title>

      <Tabs
        color={colors['blue-button']}
        variant="pills"
        value={activeTab}
        onChange={handleTabChange}
        radius="lg"
        keepMounted={false}
      >
        {/* ✅ Scroll horizontal biar gak overflow */}
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
            <>{children}</>
          </TabsPanel>
        ))}
      </Tabs>
    </Stack>
  );
}

export default LayoutTabsLayananOnlineDesa;
