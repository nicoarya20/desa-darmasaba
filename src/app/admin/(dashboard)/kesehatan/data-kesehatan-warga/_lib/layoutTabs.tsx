/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabs({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Presentase Kelahiran & Kematian",
            value: "presentasekelahiran&kematian",
            href: "/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian"
        },
        {
            label: "Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik",
            value: "grafikhasilkepuasan",
            href: "/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan"
        },
        {
            label: "Fasilitas Kesehatan",
            value: "fasilitaskesehatan",
            href: "/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan"
        },
        {
            label: "Jadwal Kegiatan",
            value: "jadwalkegiatan",
            href: "/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan"
        },
        {
            label: "Artikel Kesehatan",
            value: "artikelkesehatan",
            href: "/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan"
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
            <Title order={3}>Data Kesehatan Warga</Title>
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

export default LayoutTabs;