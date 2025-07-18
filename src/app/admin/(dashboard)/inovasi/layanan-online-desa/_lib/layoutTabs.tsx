/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabsLayananOnlineDesa({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Administrasi Online",
            value: "administrasionline",
            href: "/admin/inovasi/layanan-online-desa/administrasi-online"
        },
        {
            label: "Jenis Layanan",
            value: "jenislayanan",
            href: "/admin/inovasi/layanan-online-desa/jenis-layanan"
        },
        {
            label: "Pengaduan Masyarakat",
            value: "pengaduanmasyarakat",
            href: "/admin/inovasi/layanan-online-desa/pengaduan-masyarakat"
        },
        {
            label: "Jenis Pengaduan",
            value: "jenispengaduan",
            href: "/admin/inovasi/layanan-online-desa/jenis-pengaduan"
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
            <Title order={3}>Layanan Online Desa</Title>
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

export default LayoutTabsLayananOnlineDesa;