'use client';
import colors from '@/con/colors';
import type { PengumumanFile } from '@/lib/pengumuman-lampiran';
import { Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconDownload, IconEye, IconFileTypePdf } from '@tabler/icons-react';
import { useState } from 'react';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import { PengumumanPdfModal } from './PengumumanPdfModal';

type Props = {
  dokumen: PengumumanFile[] | null | undefined;
  /** Judul section; `null` = tanpa judul (mis. di detail admin yang sudah punya label). */
  judul?: string | null;
};

/** Daftar lampiran PDF pengumuman: nama + ukuran, pratinjau (iframe) dan unduh; tidak dirender bila kosong. */
export function PengumumanDokumenList({ dokumen, judul = 'Lampiran Dokumen' }: Props) {
  const [aktif, setAktif] = useState<PengumumanFile | null>(null);
  const daftar = (dokumen ?? []).filter((f) => !!f.link);
  if (daftar.length === 0) return null;

  return (
    <Stack gap="sm" w="100%" component="section" aria-label={judul ?? 'Lampiran dokumen'}>
      {judul && (
        <Title order={2} fz={{ base: 'lg', md: 'xl' }} fw={700}>
          {judul}
        </Title>
      )}
      {daftar.map((f) => (
        <Paper key={f.id} withBorder radius="md" p="sm" data-pengumuman-dokumen>
          <Group justify="space-between" gap="sm">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              <IconFileTypePdf size={28} color={colors['blue-button']} style={{ flexShrink: 0 }} aria-hidden />
              <Box style={{ minWidth: 0 }}>
                <Text fz="sm" fw={600} style={{ wordBreak: 'break-word' }}>
                  {f.realName}
                </Text>
                {f.size !== null && (
                  <Text fz="xs" c="dimmed">
                    PDF · {formatUkuran(f.size)}
                  </Text>
                )}
              </Box>
            </Group>
            <Group gap="xs">
              <Button size="xs" variant="light" leftSection={<IconEye size={16} />} onClick={() => setAktif(f)}>
                Pratinjau
              </Button>
              <Button
                size="xs"
                component="a"
                href={f.link}
                download={f.realName}
                leftSection={<IconDownload size={16} />}
                color={colors['blue-button']}
              >
                Unduh
              </Button>
            </Group>
          </Group>
        </Paper>
      ))}

      <PengumumanPdfModal file={aktif} onClose={() => setAktif(null)} />
    </Stack>
  );
}
