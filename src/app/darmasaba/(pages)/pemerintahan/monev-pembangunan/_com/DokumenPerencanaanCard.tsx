'use client'
import type { DokumenPerencanaanItem } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import colors from '@/con/colors';
import {
  JENIS_MUSYAWARAH_LABEL,
  formatPeriodeDokumen,
  isJenisMusyawarah,
} from '@/lib/dokumen-perencanaan';
import { Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconDownload, IconEye } from '@tabler/icons-react';

/** Kartu satu dokumen perencanaan: judul, periode/tahun, nomor Perdes, ringkasan, tombol Lihat/Unduh PDF. */
export default function DokumenPerencanaanCard({ item }: { item: DokumenPerencanaanItem }) {
  const musyawarah = isJenisMusyawarah(item.jenisMusyawarah)
    ? JENIS_MUSYAWARAH_LABEL[item.jenisMusyawarah]
    : null;

  return (
    <Paper shadow="sm" radius="lg" withBorder p="md" h="100%">
      <Stack gap="sm" h="100%" justify="space-between">
        <Stack gap="xs">
          <Group gap="xs">
            <Badge variant="light" color="blue">{formatPeriodeDokumen(item)}</Badge>
            {musyawarah && <Badge variant="outline" color="gray">{musyawarah}</Badge>}
          </Group>
          <Title order={4} c={colors['blue-button']} lineClamp={2}>{item.judul}</Title>
          {item.nomorPerdes && <Text fz="xs" c="dimmed">Nomor Perdes: {item.nomorPerdes}</Text>}
          {item.ringkasan && <Text fz="sm" lineClamp={4}>{item.ringkasan}</Text>}
        </Stack>
        {item.file ? (
          <Group gap="xs">
            <Button
              component="a"
              href={item.file.link}
              target="_blank"
              rel="noreferrer"
              variant="light"
              size="compact-sm"
              radius="md"
              leftSection={<IconEye size={16} />}
            >
              Lihat PDF
            </Button>
            <Button
              component="a"
              href={item.file.link}
              download={item.file.realName}
              size="compact-sm"
              radius="md"
              bg={colors['blue-button']}
              leftSection={<IconDownload size={16} />}
            >
              Unduh
            </Button>
          </Group>
        ) : (
          <Text fz="xs" c="dimmed">Berkas PDF belum tersedia.</Text>
        )}
      </Stack>
    </Paper>
  );
}
