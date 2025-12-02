'use client';

import { Box, Image, Select, rem } from '@mantine/core';

const sosmedMap = {
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

export default function SelectSosialMedia({
  value,
  onChange,
}: {
  value: SosmedKey;
  onChange: (value: SosmedKey) => void;
}) {
  const selected = value;
  const selectedImage = sosmedMap[selected]?.src;

  return (
    <Box maw={300}>
      <Select
        placeholder="Pilih sosial media"
        value={selected}
        data={sosmedList}
        searchable={false}
        withCheckIcon={false}
        onChange={(val) => val && onChange(val as SosmedKey)}
        styles={{
          input: {
            textAlign: 'left',
            fontSize: rem(16),
            paddingLeft: 36,
          },
          section: {
            left: 10,
            right: 'auto',
          },
        }}
      />

      {/* 🔥 PREVIEW DIPISAH DI LUAR SELECT */}
      {selectedImage && (
        <Box mt="md">
          <Image
            alt=""
            src={selectedImage}
            radius="md"
            style={{
              width: 120,
              height: 120,
              objectFit: 'contain',
              border: '1px solid #eee',
              padding: 8,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
