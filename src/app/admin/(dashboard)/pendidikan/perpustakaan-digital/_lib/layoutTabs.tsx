/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Alert, Box, ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { IconArchive, IconBook2, IconCategory, IconUser, IconWorldWww } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Tab arsip: data katalog & peminjaman lama tidak tampil di website publik lagi (perpustakaan pindah ke website
  // eksternal), tetap bisa dilihat sampai desa memutuskan dihapus. docs/decisions/2026-11-17-perpustakaan-link-eksternal.md
  const tabs = [
    {
      label: "Website Perpustakaan",
      value: "website",
      href: "/admin/pendidikan/perpustakaan-digital/website",
      icon: <IconWorldWww size={18} stroke={1.8} />,
      arsip: false,
    },
    {
      label: "Arsip Buku",
      value: "data-perpustakaan",
      href: "/admin/pendidikan/perpustakaan-digital/data-perpustakaan",
      icon: <IconBook2 size={18} stroke={1.8} />,
      arsip: true,
    },
    {
      label: "Arsip Kategori",
      value: "kategori-buku",
      href: "/admin/pendidikan/perpustakaan-digital/kategori-buku",
      icon: <IconCategory size={18} stroke={1.8} />,
      arsip: true,
    },
    {
      label: "Arsip Peminjam",
      value: "peminjam",
      href: "/admin/pendidikan/perpustakaan-digital/peminjam",
      icon: <IconUser size={18} stroke={1.8} />,
      arsip: true,
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
    <Stack gap="lg">
      <Title order={2} fw={700} style={{ color: "#1A1B1E" }}>
        Perpustakaan Digital
      </Title>
      <Tabs
        color={colors['blue-button']}
        variant='pills'
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
        
                <Box hiddenFrom='md' pb={10}>
                  <ScrollArea
                    type="hover"
                    offsetScrollbars={false}
                    w="100%"
                  >
        
                    <TabsList
                      p="xs" // lebih kecil
                      style={{
                        background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
                        borderRadius: "1rem",
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: "0.5rem",
                        width: "max-content", // ⬅️ kunci
                        maxWidth: "100%",     // ⬅️ penting
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
                            paddingInline: "0.75rem", // ⬅️ lebih ramping
                            flexShrink: 0, // ✅ jangan mengecil aneh-aneh
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
            {tab.arsip ? (
              <Alert color="gray" variant="light" radius="md" mb="md" icon={<IconArchive size={18} />} title="Arsip">
                Data ini tidak tampil di website publik. Halaman Perpustakaan Digital kini menautkan website perpustakaan
                desa (atur di tab Website Perpustakaan).
              </Alert>
            ) : null}
            {children}
          </TabsPanel>
        ))}
      </Tabs>
    </Stack>
  );
}

export default LayoutTabs;
