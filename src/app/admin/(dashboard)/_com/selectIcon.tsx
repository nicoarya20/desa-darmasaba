/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Box, rem, Select } from '@mantine/core';
import {
  IconAlertTriangle,
  IconAmbulance,
  IconBuilding,
  IconBuildingCommunity,
  IconCash,
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboardTextFilled,
  IconDroplet,
  IconFileText,
  IconFiretruck,
  IconFirstAidKit,
  IconHome,
  IconHomeEco,
  IconHospital,
  IconInfoCircle,
  IconLeaf,
  IconLifebuoy,
  IconMessageReport,
  IconPhoneCall,
  IconRecycle,
  IconRun,
  IconScale,
  IconSchool,
  IconShield,
  IconShieldFilled,
  IconShoppingCart,
  IconStethoscope,
  IconTent,
  IconTrashFilled,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const iconMap = {
  ekowisata: { label: 'Ekowisata', icon: IconLeaf },
  kompetisi: { label: 'Kompetisi', icon: IconTrophy },
  wisata: { label: 'Wisata', icon: IconTent },
  ekonomi: { label: 'Ekonomi', icon: IconChartLine },
  sampah: { label: 'Sampah', icon: IconRecycle },
  truck: { label: 'Truck', icon: IconTruckFilled },
  scale: { label: 'Scale', icon: IconScale },
  clipboard: { label: 'Clipboard', icon: IconClipboardTextFilled },
  trash: { label: 'Trash', icon: IconTrashFilled },
  lingkunganSehat: { label: 'Lingkungan Sehat', icon: IconHomeEco },
  sumberOksigen: { label: 'Sumber Oksigen', icon: IconChristmasTreeFilled },
  ekonomiBerkelanjutan: { label: 'Ekonomi Berkelanjutan', icon: IconTrendingUp },
  mencegahBencana: { label: 'Mencegah Bencana', icon: IconShieldFilled },
  rumah: { label: 'Rumah', icon: IconHome },
  pohon: { label: 'Pohon', icon: IconTree },
  air: { label: 'Air', icon: IconDroplet },
  bantuan: { label: 'Bantuan', icon: IconCash },
  pelatihan: { label: 'Pelatihan', icon: IconSchool },
  subsidi: { label: 'Subsidi', icon: IconShoppingCart },
  layananKesehatan: { label: 'Layanan Kesehatan', icon: IconHospital },

  // ===== Keamanan & Darurat =====
  polisi: { label: 'Polisi', icon: IconShieldFilled },
  ambulans: { label: 'Ambulans', icon: IconAmbulance },
  pemadam: { label: 'Pemadam Kebakaran', icon: IconFiretruck },
  darurat: { label: 'Darurat', icon: IconAlertTriangle },
  sar: { label: 'SAR / Basarnas', icon: IconLifebuoy },
  evakuasi: { label: 'Evakuasi', icon: IconRun },
  keamanan: { label: 'Keamanan', icon: IconShield },
  teleponDarurat: { label: 'Telepon Darurat', icon: IconPhoneCall },

  // ===== Kesehatan =====
  rumahSakit: { label: 'Rumah Sakit', icon: IconHospital },
  puskesmas: { label: 'Puskesmas', icon: IconFirstAidKit },
  klinik: { label: 'Klinik', icon: IconStethoscope },

  // ===== Pemerintahan & Fasilitas =====
  bangunan: { label: 'Bangunan', icon: IconBuilding },
  kantorDesa: { label: 'Kantor Desa', icon: IconBuildingCommunity },
  administrasi: { label: 'Administrasi', icon: IconFileText },
  informasi: { label: 'Informasi', icon: IconInfoCircle },
  pengaduan: { label: 'Pengaduan', icon: IconMessageReport },
  layananPublik: { label: 'Layanan Publik', icon: IconUsers },
};


type IconKey = keyof typeof iconMap;

const iconList = Object.entries(iconMap).map(([value, data]) => ({
  value,
  label: data.label,
}));

export default function SelectIconProgram(
  { onChange }: { onChange: (value: IconKey) => void }) {
  const [selectedIcon, setSelectedIcon] = useState<IconKey>('ekowisata');
  const IconComponent = iconMap[selectedIcon]?.icon || null;

  // Push default icon ke state saat render awal
  useEffect(() => {
    onChange(selectedIcon);
  }, []);

  return (
    <Box maw={300}>
      <Select
        placeholder="Pilih ikon"
        value={selectedIcon}
        onChange={(value) => {
          if (value) {
            setSelectedIcon(value as IconKey);
            onChange(value as IconKey);
          }
        }}
        data={iconList}
        leftSection={
          IconComponent && (
            <Box>
              <IconComponent size={24} stroke={1.5} />
            </Box>
          )
        }
        withCheckIcon={false}
        searchable={false}
        rightSectionWidth={0}
        styles={{
          input: {
            textAlign: 'left',
            fontSize: rem(16),
            paddingLeft: 40,
          },
          section: {
            left: 10,
            right: 'auto',
          },
        }}
      />
    </Box>
  );
}
