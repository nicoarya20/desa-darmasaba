/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabsDetail({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Profile Desa",
            value: "profiledesa",
            href: "/admin/desa/profile/profile-desa"
        },
        {
            label: "Profile Perbekel",
            value: "profileperbekel",
            href: "/admin/desa/profile/profile-perbekel"
        },
        {
            label: "Profile Perbekel Dari Masa Ke Masa",
            value: "profile-perbekel-dari-masa-ke-masa",
            href: "/admin/desa/profile/profile-perbekel-dari-masa-ke-masa"
        }
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
        <Stack>
            <Title order={3}>Profile Desa</Title>
            <Tabs color={colors['blue-button']} variant='pills' value={activeTab} onChange={handleTabChange}>
                <TabsList p={"xs"} bg={"#BBC8E7FF"}>
                    {tabs.map((e, i) => (
                        <TabsTab key={i} value={e.value}>{e.label}</TabsTab>
                    ))}
                </TabsList>
                {tabs.map((e, i) => (
                    <TabsPanel key={i} value={e.value}>
                        {/* Konten dummy, bisa diganti tergantung routing */}
                        <></>
                    </TabsPanel>
                ))}
            </Tabs>
            {children}
        </Stack>
    );
}

export default LayoutTabsDetail;