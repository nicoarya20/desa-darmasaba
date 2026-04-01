'use client';

import { Box, Select } from '@mantine/core';
import { useEffect, useState } from 'react';

export const sosmedMap = {
  facebook: { label: 'Facebook', src: '/assets/images/sosmed/facebook.png' },
  instagram: { label: 'Instagram', src: '/assets/images/sosmed/instagram.png' },
  tiktok: { label: 'Tiktok', src: '/assets/images/sosmed/tiktok.png' },
  youtube: { label: 'YouTube', src: '/assets/images/sosmed/youtube.png' },
  whatsapp: { label: 'WhatsApp', src: '/assets/images/sosmed/whatsapp.png' },
  gmail: { label: 'Gmail', src: '/assets/images/sosmed/gmail.png' },
  telegram: { label: 'Telegram', src: '/assets/images/sosmed/telegram.png' },
  x: { label: 'X (Twitter)', src: '/assets/images/sosmed/x-twitter.png' },
  telephone: { label: 'Telephone', src: '/assets/images/sosmed/telephone-call.png' },
  custom: { label: 'Custom Icon', src: null },
};

type SosmedKey = keyof typeof sosmedMap;

const sosmedList = Object.entries(sosmedMap).map(([value, item]) => ({
  value,
  label: item.label,
}));

export default function SelectSocialMediaEdit({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: SosmedKey) => void;
}) {
  const [selected, setSelected] = useState<SosmedKey>('facebook');

  useEffect(() => {
    if (value && sosmedMap[value as SosmedKey]) {
      setSelected(value as SosmedKey);
    }
  }, [value]);

  return (
    <Box>
      <Select
        label="Jenis Media Sosial"
        value={selected}
        data={sosmedList}
        searchable={false}
        onChange={(val) => {
          if (!val) return;
          setSelected(val as SosmedKey);
          onChange(val as SosmedKey);
        }}
      />
    </Box>
  );
}
