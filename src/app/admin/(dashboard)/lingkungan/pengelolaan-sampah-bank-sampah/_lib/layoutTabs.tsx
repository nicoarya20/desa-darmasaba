/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { IconTrash, IconRecycle } from '@tabler/icons-react';

function LayoutTabsPengelolaanSampahBankSampah({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: "List Pengelolaan Sampah Bank Sampah",
      value: "listpengelolaansampahbanksampah",
      href: "/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah",
      icon: <IconTrash size={18} stroke={1.8} />,
      tooltip: "Kelola data pengelolaan sampah bank sampah",
    },
    {
      label: "Keterangan Bank Sampah Terdekat",
      value: "keteranganbanksampahterdekat",
      href: "/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat",
      icon: <IconRecycle size={18} stroke={1.8} />,
      tooltip: "Kelola data bank sampah terdekat",
    },
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
    <Stack gap="md">
      <Title order={3} mb="sm">Pengelolaan Sampah Bank Sampah</Title>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="pills"
        radius="md"
      >
        <TabsList>
          {tabs.map((tab) => (
            <Tooltip
              key={tab.value}
              label={tab.tooltip}
              position="top"
              withArrow
              transitionProps={{ transition: 'pop', duration: 300 }}
            >
              <TabsTab 
                value={tab.value}
                leftSection={tab.icon}
                style={{
                  padding: '10px 20px',
                  height: 'auto',
                  minHeight: 44,
                }}
              >
                {tab.label}
              </TabsTab>
            </Tooltip>
          ))}
        </TabsList>
        <TabsPanel 
          value={activeTab || ''} 
          pt="lg"
          style={{
            minHeight: '60vh',
          }}
        >
          {children}
        </TabsPanel>
      </Tabs>
    </Stack>
  );
}

export default LayoutTabsPengelolaanSampahBankSampah;