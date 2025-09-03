/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { IconFileText, IconBuildingStore, IconSparkles, IconUsers } from '@tabler/icons-react';

function LayoutTabsLayanan({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Pelayanan Surat Keterangan",
            value: "pelayanansuratketerangan",
            href: "/admin/desa/layanan/pelayanan_surat_keterangan",
            icon: <IconFileText size={18} stroke={1.8} />,
            tooltip: "Layanan terkait surat keterangan resmi desa"
        },
        {
            label: "Pelayanan Perizinan Berusaha",
            value: "pelayananperizinanusaha",
            href: "/admin/desa/layanan/pelayanan_perizinan_berusaha",
            icon: <IconBuildingStore size={18} stroke={1.8} />,
            tooltip: "Layanan untuk izin usaha masyarakat"
        },
        {
            label: "Pelayanan Telunjuk Sakti Desa",
            value: "pelayanantelunjuksaktidesa",
            href: "/admin/desa/layanan/pelayanan_telunjuk_sakti_desa",
            icon: <IconSparkles size={18} stroke={1.8} />,
            tooltip: "Layanan inovasi khusus desa"
        },
        {
            label: "Pelayanan Penduduk Non-Permanent",
            value: "pelayanannonpermanent",
            href: "/admin/desa/layanan/pelayanan_penduduk_non_permanent",
            icon: <IconUsers size={18} stroke={1.8} />,
            tooltip: "Pendataan penduduk non-permanent"
        }
    ];

    const currentTab = tabs.find(tab => tab.href === pathname)
    const [activeTab, setActiveTab] = useState<string | null>(currentTab?.value || tabs[0].value);

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
            <Title order={3} fw={700} style={{ color: "#1A1B1E" }}>Layanan</Title>
            <Tabs
                color={colors['blue-button']}
                variant='pills'
                value={activeTab}
                onChange={handleTabChange}
                radius="lg"
                keepMounted={false}
            >
                <TabsList
                    p="sm"
                    style={{
                        background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
                        borderRadius: "1rem",
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                    }}
                >
                    {tabs.map((tab, i) => (
                        <Tooltip 
                            key={i} 
                            label={tab.tooltip} 
                            position="bottom" 
                            withArrow 
                            transitionProps={{ transition: 'pop', duration: 200 }}
                        >
                            <TabsTab
                                value={tab.value}
                                leftSection={tab.icon}
                                style={{
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {tab.label}
                            </TabsTab>
                        </Tooltip>
                    ))}
                </TabsList>

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
                        {/* Konten dummy, bisa diganti sesuai routing */}
                        <>{children}</>
                    </TabsPanel>
                ))}
            </Tabs>
        </Stack>
    );
}

export default LayoutTabsLayanan;
