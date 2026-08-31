/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { IconCalendarEvent, IconCategory } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabsKegiatanDesa({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        {
            label: "List Kegiatan",
            value: "list_kegiatan",
            href: "/admin/desa/kegiatan-desa/list-kegiatan-desa",
            icon: <IconCalendarEvent size={22} stroke={1.8} />
        },
        {
            label: "Kategori Kegiatan",
            value: "kategori_kegiatan",
            href: "/admin/desa/kegiatan-desa/kategori-kegiatan-desa",
            icon: <IconCategory size={22} stroke={1.8} />
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
            <Title order={3} fw={700} style={{ color: "#1A1B1E" }}>Kegiatan Desa</Title>
            <Tabs
                color={colors["blue-button"]}
                variant="pills"
                value={activeTab}
                onChange={handleTabChange}
                radius="lg"
                keepMounted={false}
            >
                {/* ✅ Desktop: scroll horizontal wrapper */}
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

                {/* ✅ Mobile: pill lebih ramping */}
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
                        <>{children}</>
                    </TabsPanel>
                ))}
            </Tabs>
        </Stack>
    );
}

export default LayoutTabsKegiatanDesa;
