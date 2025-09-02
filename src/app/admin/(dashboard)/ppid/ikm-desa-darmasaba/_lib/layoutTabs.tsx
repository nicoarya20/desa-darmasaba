/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { IconChartBar, IconUsers } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabsIKM({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Indeks Kepuasan Masyarakat",
            description: "Lihat dan kelola indeks kepuasan masyarakat",
            value: "indekskepuasannamasyarakat",
            href: "/admin/ppid/ikm-desa-darmasaba/indeks-kepuasan-masyarakat",
            icon: <IconChartBar size={18} stroke={1.8} />
        },
        {
            label: "Responden",
            description: "Kelola dan tinjau data responden",
            value: "responden",
            href: "/admin/ppid/ikm-desa-darmasaba/responden",
            icon: <IconUsers size={18} stroke={1.8} />
        },
    ];
    const curentTab = tabs.find(tab => tab.href === pathname)
    const [activeTab, setActiveTab] = useState<string | null>(curentTab?.value || tabs[0].value);

    const handleTabChange = (value: string | null) => {
        const tab = tabs.find(t => t.value === value)
        if (tab) {
            router.push(tab.href)
        }
        setActiveTab(value)
    }

    useEffect(() => {
        const match = tabs.find(tab => tab.href === pathname)
        if (match) {
            setActiveTab(match.value)
        }
    }, [pathname])

    return (
        <Stack gap="lg">
            <Title order={2} style={{ fontWeight: 700, color: "#1a1a1a" }}>
                IKM Desa Darmasaba
            </Title>
            <Tabs
                radius="xl"
                color={colors['blue-button']}
                variant="pills"
                value={activeTab}
                onChange={handleTabChange}
            >
                <TabsList
                    p="sm"
                    style={{
                        background: "#F3F4FB",
                        borderRadius: "1rem",
                    }}
                >
                    {tabs.map((e, i) => (
                        <Tooltip 
                            key={i} 
                            label={e.description} 
                            withArrow 
                            position="bottom" 
                            transitionProps={{ transition: 'pop', duration: 200 }}
                        >
                            <TabsTab
                                value={e.value}
                                leftSection={e.icon}
                                style={{
                                    fontWeight: 500,
                                    fontSize: "0.9rem",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {e.label}
                            </TabsTab>
                        </Tooltip>
                    ))}
                </TabsList>
                {tabs.map((e, i) => (
                    <TabsPanel key={i} value={e.value} mt="md">
                        {/* Konten dummy, bisa diganti tergantung routing */}
                        <></>
                    </TabsPanel>
                ))}
            </Tabs>
            {children}
        </Stack>
    );
}

export default LayoutTabsIKM;