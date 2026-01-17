'use client';

import { Box, Group, rem, Select, SelectProps } from '@mantine/core';
import {
  IconAmbulance,
  IconCash,
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboardTextFilled,
  IconDroplet,
  IconFiretruck,
  IconHome,
  IconHomeEco,
  IconHospital,
  IconLeaf,
  IconRecycle,
  IconScale,
  IconSchool,
  IconShieldFilled,
  IconShoppingCart,
  IconTent,
  IconTrashFilled,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled,
  IconBuilding,
  IconAlertTriangle,
  IconBuildingCommunity,
  IconFileText,
  IconFirstAidKit,
  IconInfoCircle,
  IconLifebuoy,
  IconMessageReport,
  IconPhoneCall,
  IconRun,
  IconShield,
  IconStethoscope,
  IconUsers,
} from '@tabler/icons-react';

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

export type IconKey = keyof typeof iconMap;

const iconList = Object.entries(iconMap).map(([value, data]) => ({
  value,
  label: data.label,
}));

export default function SelectIconProgramEdit({
  onChange,
  value,
  ...props
}: {
  onChange: (value: IconKey | '') => void;
  value: IconKey | '';
} & Omit<SelectProps, 'onChange' | 'value' | 'data'>) {
  return (
    <Box maw={300}>
      <Select
        placeholder="Pilih ikon"
        value={value || ''}
        onChange={(val: string | null) => {
          if (val) {
            onChange(val as IconKey);
          } else {
            onChange('');
          }
        }}
        data={iconList}
        renderOption={({ option }) => {
          const Icon = iconMap[option.value as IconKey]?.icon;
          return (
            <Group gap="sm">
              {Icon && <Icon size={18} stroke={1.5} />}
              {option.label}
            </Group>
          );
        }}
        leftSection={
          value && iconMap[value as IconKey] ? (
            <Box ml={-4}>
              {(() => {
                const Icon = iconMap[value as IconKey].icon;
                return <Icon size={20} stroke={1.5} />;
              })()}
            </Box>
          ) : null
        }
        searchable
        styles={{
          input: {
            paddingLeft: 40,
            fontSize: rem(16),
          },
        }}
        {...props}
      />
    </Box>
  );
}