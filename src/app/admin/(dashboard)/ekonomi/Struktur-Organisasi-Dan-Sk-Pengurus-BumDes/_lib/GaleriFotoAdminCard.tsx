'use client'
import type { FotoProfilBumdesData } from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/foto-profil';
import { MAX_KETERANGAN_FOTO } from '@/lib/bumdes-foto-profil';
import { ActionIcon, Group, Image, Paper, TextInput, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

export type GaleriFotoAdminCardProps = {
  foto: FotoProfilBumdesData;
  index: number;
  total: number;
  saving: boolean;
  moveLocked: boolean;
  onSaveKeterangan: (keterangan: string) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
};

/** Kartu satu foto galeri admin: thumbnail, input keterangan, geser urutan, hapus. */
export default function GaleriFotoAdminCard({
  foto,
  index,
  total,
  saving,
  moveLocked,
  onSaveKeterangan,
  onMove,
  onDelete,
}: GaleriFotoAdminCardProps) {
  const [keterangan, setKeterangan] = useState(foto.keterangan ?? '');
  const berubah = keterangan.trim() !== (foto.keterangan ?? '');
  const nomor = index + 1;

  return (
    <Paper withBorder radius="md" p="xs" data-testid="galeri-foto-admin-card">
      <Image src={foto.image.link} alt={foto.keterangan ?? `Foto galeri ${nomor}`} h={140} radius="sm" fit="cover" />
      <TextInput
        mt="xs"
        size="xs"
        aria-label={`Keterangan foto ${nomor}`}
        placeholder="Keterangan (opsional)"
        maxLength={MAX_KETERANGAN_FOTO}
        value={keterangan}
        onChange={(e) => setKeterangan(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && berubah) onSaveKeterangan(keterangan);
        }}
      />
      <Group justify="space-between" mt="xs" gap={4}>
        <Group gap={4}>
          <Tooltip label="Geser ke depan">
            <ActionIcon
              variant="light"
              aria-label={`Geser foto ${nomor} ke depan`}
              disabled={moveLocked || index === 0}
              onClick={() => onMove(-1)}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Geser ke belakang">
            <ActionIcon
              variant="light"
              aria-label={`Geser foto ${nomor} ke belakang`}
              disabled={moveLocked || index === total - 1}
              onClick={() => onMove(1)}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group gap={4}>
          <Tooltip label="Simpan keterangan">
            <ActionIcon
              variant="light"
              color="green"
              aria-label={`Simpan keterangan foto ${nomor}`}
              disabled={!berubah}
              loading={saving}
              onClick={() => onSaveKeterangan(keterangan)}
            >
              <IconDeviceFloppy size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Hapus foto">
            <ActionIcon variant="light" color="red" aria-label={`Hapus foto ${nomor}`} onClick={onDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
