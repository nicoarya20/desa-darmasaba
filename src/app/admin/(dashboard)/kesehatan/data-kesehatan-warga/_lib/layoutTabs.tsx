/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title, Tooltip } from '@mantine/core';
import { IconActivity, IconBuildingHospital, IconCalendarEvent, IconGauge, IconNotes } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


function LayoutTabs({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const pathname = usePathname();


 const tabs = [
   {
     label: "Presentase Kelahiran & Kematian",
     value: "presentasekelahiran&kematian",
     href: "/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian",
     icon: <IconActivity size={18} stroke={1.8} />,
     tooltip: "Lihat data kelahiran dan kematian"
   },
   {
     label: "Grafik Hasil Kepuasan Masyarakat",
     value: "grafikhasilkepuasan",
     href: "/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan",
     icon: <IconGauge size={18} stroke={1.8} />,
     tooltip: "Grafik kepuasan masyarakat terhadap pelayanan"
   },
   {
     label: "Fasilitas Kesehatan",
     value: "fasilitaskesehatan",
     href: "/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan",
     icon: <IconBuildingHospital size={18} stroke={1.8} />,
     tooltip: "Data fasilitas kesehatan desa"
   },
   {
     label: "Jadwal Kegiatan",
     value: "jadwalkegiatan",
     href: "/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan",
     icon: <IconCalendarEvent size={18} stroke={1.8} />,
     tooltip: "Atur jadwal kegiatan kesehatan"
   },
   {
     label: "Artikel Kesehatan",
     value: "artikelkesehatan",
     href: "/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan",
     icon: <IconNotes size={18} stroke={1.8} />,
     tooltip: "Artikel & informasi seputar kesehatan"
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
     <Title order={2} fw={700} style={{ color: "#1A1B1E" }}>
       Data Kesehatan Warga
     </Title>
     <Tabs
       color={colors['blue-button']}
       variant="pills"
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
           {children}
         </TabsPanel>
       ))}
     </Tabs>
   </Stack>
 );
}


export default LayoutTabs;