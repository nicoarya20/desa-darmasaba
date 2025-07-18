/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Box, rem, Select } from '@mantine/core';
import {
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboardTextFilled,
  IconHomeEco,
  IconLeaf,
  IconRecycle,
  IconScale,
  IconShieldFilled,
  IconTent,
  IconTrashFilled,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled,
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
  lingkunganSehat: {label: 'Lingkungan Sehat', icon: IconHomeEco},
  sumberOksigen: {label: 'Sumber Oksigen', icon: IconChristmasTreeFilled},
  ekonomiBerkelanjutan: {label: 'Ekonomi Berkelanjutan', icon: IconTrendingUp},
  mencegahBencana: {label: 'Mencegah Bencana', icon: IconShieldFilled},

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
