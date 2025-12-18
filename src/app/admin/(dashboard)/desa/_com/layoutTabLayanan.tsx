/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, ScrollArea, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import { IconBuildingStore, IconFileText, IconSparkles, IconUsers, IconUsersPlus } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function LayoutTabsLayanan({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = [
        {
            label: "Pelayanan Surat Keterangan",
            value: "pelayanansuratketerangan",
            href: "/admin/desa/layanan/pelayanan_surat_keterangan",
            icon: <IconFileText size={18} stroke={1.8} />
        },
        {
            label: "Pelayanan Perizinan Berusaha",
            value: "pelayananperizinanusaha",
            href: "/admin/desa/layanan/pelayanan_perizinan_berusaha",
            icon: <IconBuildingStore size={18} stroke={1.8} />
        },
        {
            label: "Pelayanan Telunjuk Sakti Desa",
            value: "pelayanantelunjuksaktidesa",
            href: "/admin/desa/layanan/pelayanan_telunjuk_sakti_desa",
            icon: <IconSparkles size={18} stroke={1.8} />
        },
        {
            label: "Pelayanan Penduduk Non-Permanent",
            value: "pelayanannonpermanent",
            href: "/admin/desa/layanan/pelayanan_penduduk_non_permanent",
            icon: <IconUsers size={18} stroke={1.8} />
        },
        {
            label: "Ajukan Permohonan",
            value: "ajukanpermohonan",
            href: "/admin/desa/layanan/ajukan_permohonan",
            icon: <IconUsersPlus size={18} stroke={1.8} />
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
                color={colors["blue-button"]}
                variant="pills"
                value={activeTab}
                onChange={handleTabChange}
                radius="lg"
                keepMounted={false}
            >
                {/* ✅ Scroll horizontal wrapper */}
                <Box visibleFrom='md' pb={10}>
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
                        type="auto"
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
                        {/* Konten dummy, bisa diganti sesuai routing */}
                        <>{children}</>
                    </TabsPanel>
                ))}
            </Tabs>
        </Stack>
    );
}

export default LayoutTabsLayanan;
