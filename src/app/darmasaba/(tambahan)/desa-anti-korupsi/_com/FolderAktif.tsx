'use client';
import colors from '@/con/colors';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconFolderOpen } from '@tabler/icons-react';
import Link from 'next/link';
import { programHref } from '../_lib/program-folder';
import { urutkanItems, type UrutValue } from '../_lib/program-urut';
import { DokumenEmptyState } from './DokumenEmptyState';
import { DokumenRingkasList } from './DokumenRingkasList';
import { UnduhZipButton } from './UnduhZipButton';

type Props = {
  programId: string;
  folder: FolderGroupView;
  urut: UrutValue;
  onPreview: (dokumen: DokumenDesaAntiKorupsiView) => void;
};

/** Isi satu folder terbuka: nama + jumlah, Unduh folder (ZIP), kembali ke semua folder, daftar dokumen terurut. */
export function FolderAktif({ programId, folder, urut, onPreview }: Props) {
  const kosong = folder.dokumen.length === 0;
  return (
    <Stack gap="sm">
      <Group justify="space-between" gap="xs">
        <Group gap="xs" wrap="nowrap" miw={0}>
          <IconFolderOpen size={22} color={colors['blue-button']} style={{ flexShrink: 0 }} />
          <Text fw={600} truncate data-testid="folder-aktif">
            {folder.nama}
          </Text>
          <Text fz="sm" c="dimmed" style={{ flexShrink: 0 }}>
            ({folder.dokumen.length} dokumen)
          </Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <UnduhZipButton programId={programId} folder={folder.key} label="Unduh folder (ZIP)" disabled={kosong} />
          <Button component={Link} href={programHref(programId, null, urut)} scroll={false} variant="subtle" size="xs">
            Semua folder
          </Button>
        </Group>
      </Group>
      {kosong ? (
        <DokumenEmptyState>Folder ini belum berisi dokumen</DokumenEmptyState>
      ) : (
        <DokumenRingkasList
          items={urutkanItems(folder.dokumen, (d) => d, urut).map((dokumen) => ({ dokumen }))}
          onPreview={onPreview}
        />
      )}
    </Stack>
  );
}
