'use client';
import colors from '@/con/colors';
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconFolderOpen } from '@tabler/icons-react';
import Link from 'next/link';
import { urutkanItems, type UrutValue } from '../_lib/program-urut';
import { DokumenEmptyState } from './DokumenEmptyState';
import { DokumenRingkasList } from './DokumenRingkasList';
import { FolderChips } from './FolderChips';
import { UnduhZipButton } from './UnduhZipButton';

type Props = {
  programId: string;
  folder: FolderGroupView;
  /** Semua folder program, untuk baris chip pindah folder (tampil bila lebih dari satu). */
  groups: readonly FolderGroupView[];
  urut: UrutValue;
  /** Tujuan aksi kembali pada keadaan folder kosong (sama dengan tombol kembali halaman). */
  backHref: string;
  onPreview: (dokumen: DokumenDesaAntiKorupsiView) => void;
};

/** Isi satu folder terbuka: chip pindah folder, nama + jumlah, Unduh folder (ZIP) bila berisi, daftar dokumen. */
export function FolderAktif({ programId, folder, groups, urut, backHref, onPreview }: Props) {
  const kosong = folder.dokumen.length === 0;
  return (
    <Stack gap="md">
      {groups.length > 1 && <FolderChips programId={programId} groups={groups} activeKey={folder.key} urut={urut} />}
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
        {/* Folder kosong tidak punya isi untuk diarsipkan → tombol tidak dirender. */}
        {!kosong && <UnduhZipButton programId={programId} folder={folder.key} label="Unduh folder (ZIP)" disabled={false} />}
      </Group>
      {kosong ? (
        <DokumenEmptyState
          subteks="Dokumen akan tampil di sini setelah diunggah oleh pemerintah desa."
          aksi={
            <Button
              component={Link}
              href={backHref}
              scroll={false}
              variant="light"
              color={colors['blue-button']}
              radius="xl"
              size="xs"
              leftSection={<IconArrowLeft size={14} />}
            >
              Kembali
            </Button>
          }
        >
          Folder ini belum berisi dokumen
        </DokumenEmptyState>
      ) : (
        <DokumenRingkasList
          items={urutkanItems(folder.dokumen, (d) => d, urut).map((dokumen) => ({ dokumen }))}
          onPreview={onPreview}
        />
      )}
    </Stack>
  );
}
