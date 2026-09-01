'use client';

/**
 * Tampilan field "Jadwal Pelayanan" Posyandu (detail admin & halaman publik).
 * Merender daftar terstruktur; data lama berupa HTML dirender lewat fallback.
 */

import { isLegacyJadwal, jadwalToLines } from '@/lib/jadwal-pelayanan';
import { Box, MantineColor, MantineFontSize, StyleProp, Stack, Text } from '@mantine/core';

interface JadwalPelayananViewProps {
  value: string | null | undefined;
  /** Warna teks (default "dimmed"). */
  c?: MantineColor;
  /** Ukuran font (mengikuti prop Mantine Text, mendukung nilai responsif). */
  fz?: StyleProp<MantineFontSize | (string & {}) | number>;
  /** Teks saat kosong (default "–"). */
  emptyText?: string;
}

function JadwalPelayananView({
  value,
  c = 'dimmed',
  fz = 'md',
  emptyText = '–',
}: JadwalPelayananViewProps) {
  const lines = jadwalToLines(value);

  if (lines.length === 0) {
    // Data lama (HTML) tetap ditampilkan agar tidak hilang sebelum di-migrasi
    if (isLegacyJadwal(value)) {
      return (
        <Text
          fz={fz}
          c={c}
          dangerouslySetInnerHTML={{ __html: value as string }}
          style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
        />
      );
    }
    return (
      <Text fz={fz} c={c}>
        {emptyText}
      </Text>
    );
  }

  return (
    <Stack gap={4}>
      {lines.map((line, i) => (
        <Box key={i}>
          <Text fz={fz} c={c} span fw={600}>
            {line.label}
          </Text>
          {line.jam && (
            <Text fz={fz} c={c} span>
              {' '}
              — {line.jam}
            </Text>
          )}
        </Box>
      ))}
    </Stack>
  );
}

export default JadwalPelayananView;
