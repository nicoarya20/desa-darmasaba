/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { IconBook, IconLeaf, IconSchool } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const tabs = [
        {
            label: "Tujuan Edukasi Lingkungan",
            value: "tujuanedukasilingkungan",
            href: "/admin/lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan",
            tooltip: "Lihat tujuan edukasi lingkungan",
            icon: <IconLeaf size={18} stroke={1.8} />
        },
        {
            label: "Materi Edukasi Yang Diberikan",
            value: "materiedukasiyangdiberikan",
            href: "/admin/lingkungan/edukasi-lingkungan/materi-edukasi-yang-diberikan",
            tooltip: "Kelola materi edukasi yang diberikan",
            icon: <IconBook size={18} stroke={1.8} />
        },
        {
            label: "Contoh Kegiatan Di Desa Darmasaba",
            value: "contohkegiatan",
            href: "/admin/lingkungan/edukasi-lingkungan/contoh-kegiatan-desa-darmasaba",
            tooltip: "Lihat contoh kegiatan desa Darmasaba",
            icon: <IconSchool size={18} stroke={1.8} />
        },
    ];

    const currentTab = tabs.find(tab => tab.href === pathname)
    const [activeTab, setActiveTab] = useState<string | null>(currentTab?.value || tabs[0].value);

    const handleTabChange = (value: string | null) => {
        const tab = tabs.find(t => t.value === value)
        if (tab) router.push(tab.href)
        setActiveTab(value)
    }

    useEffect(() => {
        const match = tabs.find(tab => tab.href === pathname)
        if (match) setActiveTab(match.value)
    }, [pathname])

    return (
        <Stack gap="md">
            <Title order={2} fw={700} style={{ color: "#1A1B1E" }}>
                Edukasi Lingkungan
            </Title>

            <Tabs
                color={colors['blue-button']}
                variant="pills"
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
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: "0.5rem",
                            paddingInline: "0.5rem",
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
                                        whiteSpace: "nowrap",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <span style={{
                                        display: "inline-block",
                                        maxWidth: "200px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {tab.label}
                                    </span>
                                </TabsTab>
                            </Tooltip>
                        ))}
                    </TabsList>
                </ScrollArea>

                {tabs.map((tab, i) => (
                    <TabsPanel key={i} value={tab.value}>
                        <Box p="md">
                            {children}
                        </Box>
                    </TabsPanel>
                ))}
            </Tabs>
        </Stack>
    )
}

export default LayoutTabs;
