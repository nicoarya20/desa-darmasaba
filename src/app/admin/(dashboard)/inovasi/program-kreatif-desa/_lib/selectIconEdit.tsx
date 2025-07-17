'use client'

import { Box, rem, Select } from '@mantine/core';
import {
  IconChartLine,
  IconClipboardTextFilled,
  IconLeaf,
  IconRecycle,
  IconScale,
  IconTent,
  IconTrashFilled,
  IconTrophy,
  IconTruckFilled,
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
};

type IconKey = keyof typeof iconMap;

const iconList = Object.entries(iconMap).map(([value, data]) => ({
  value,
  label: data.label,
}));

export default function SelectIconProgramEdit({
  onChange,
  value,
}: {
  onChange: (value: IconKey) => void;
  value: IconKey;
}) {
  const IconComponent = iconMap[value]?.icon || null;

  return (
    <Box maw={300}>
      <Select
        placeholder="Pilih ikon"
        value={value}
        onChange={(value) => {
          if (value) onChange(value as IconKey);
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

