/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { IconSchool, IconTarget } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: "Tujuan Program",
      value: "tujuan-program",
      href: "/admin/pendidikan/program-pendidikan-anak/tujuan-program",
      icon: <IconTarget size={18} stroke={1.8} />
    },
    {
      label: "Program Unggulan",
      value: "program-unggulan",
      href: "/admin/pendidikan/program-pendidikan-anak/program-unggulan",
      icon: <IconSchool size={18} stroke={1.8} />
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
        Program Pendidikan Anak
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
            {children}
          </TabsPanel>
        ))}
      </Tabs>
    </Stack>
  );
}

export default LayoutTabs;
