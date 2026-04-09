/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

function LayoutTabsEdit({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Sejarah Desa",
            value: "sejarahdesa",
            href: "/admin/desa/profil/edit/sejarah_desa"
        },
        {
            label: "Visi Misi Desa",
            value: "visimisidesa",
            href: "/admin/desa/profil/edit/visi_misi_desa"
        },
        {
            label: "Lambang Desa",
            value: "lambangdesa",
            href: "/admin/desa/profil/edit/lambang_desa"
        },
        {
            label: "Maskot Desa",
            value: "maskotdesa",
            href: "/admin/desa/profil/edit/maskot_desa"
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
        <Stack>
         <Tabs color={colors['blue-button']} variant='default' value={activeTab} onChange={handleTabChange}>
                <TabsList>
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

export default LayoutTabsEdit;