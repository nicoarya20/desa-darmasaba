import colors from '@/con/colors';
import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconChevronRight, IconFolder } from '@tabler/icons-react';
import Link from 'next/link';
import { programHref, ringkasanIsi } from '../_lib/program-folder';

type Props = {
  id: string;
  name: string;
  kategori?: string | null;
  jumlahFolder: number;
  jumlahDokumen: number;
};

// 3 baris × line-height 1.4 → tinggi judul tetap, kartu dalam grid rata tinggi.
const JUDUL_LINE_HEIGHT = 1.4;
const JUDUL_MAX_LINES = 3;

/** Kartu program publik berukuran seragam: judul (maks 3 baris), kategori, ringkasan isi, tombol Buka. */
export function ProgramFolderCard({ id, name, kategori, jumlahFolder, jumlahDokumen }: Props) {
  return (
    <Paper
      h="100%"
      p="lg"
      shadow="md"
      radius="xl"
      withBorder
      data-program-id={id}
      style={{ background: 'linear-gradient(135deg, #ffffff, #f8fbff)' }}
    >
      <Stack h="100%" gap="md" justify="space-between">
        <Stack gap={6}>
          {kategori && (
            <Text fz="xs" fw={600} c="dimmed" tt="uppercase" lineClamp={1}>
              {kategori}
            </Text>
          )}
          <Text
            fz="lg"
            fw={600}
            c={colors['blue-button']}
            lh={JUDUL_LINE_HEIGHT}
            lineClamp={JUDUL_MAX_LINES}
            mih={`${JUDUL_LINE_HEIGHT * JUDUL_MAX_LINES}em`}
            title={name}
          >
            {name}
          </Text>
        </Stack>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap={6} wrap="nowrap" miw={0}>
            <IconFolder size={18} color={colors['blue-button']} style={{ flexShrink: 0 }} />
            <Text fz="sm" c="dimmed" truncate data-testid="ringkasan-isi">
              {ringkasanIsi(jumlahFolder, jumlahDokumen)}
            </Text>
          </Group>
          <Button
            component={Link}
            href={programHref(id)}
            size="xs"
            radius="xl"
            color={colors['blue-button']}
            rightSection={<IconChevronRight size={14} />}
            aria-label={`Buka ${name}`}
          >
            Buka
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
