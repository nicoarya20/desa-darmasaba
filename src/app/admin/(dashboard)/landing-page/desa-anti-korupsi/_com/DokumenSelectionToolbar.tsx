'use client';
import { ActionIcon, Button, Group, Paper, Text, Tooltip } from '@mantine/core';
import { IconArrowsMove, IconCopy, IconTrash, IconX } from '@tabler/icons-react';
import type { ComponentType } from 'react';

type Props = {
  count: number;
  onMove: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onClear: () => void;
};

type Aksi = {
  label: string;
  Icon: ComponentType<{ size?: number }>;
  color?: string;
  variant: 'light' | 'subtle';
  onClick: () => void;
};

/** Bar aksi sticky untuk dokumen terpilih (pindah, salin, hapus, batal); tidak dirender saat tidak ada pilihan. */
export function DokumenSelectionToolbar({ count, onMove, onCopy, onDelete, onClear }: Props) {
  if (count <= 0) return null;

  const aksi: Aksi[] = [
    { label: 'Pindahkan ke…', Icon: IconArrowsMove, variant: 'light', onClick: onMove },
    { label: 'Salin ke…', Icon: IconCopy, variant: 'light', onClick: onCopy },
    { label: 'Hapus', Icon: IconTrash, color: 'red', variant: 'light', onClick: onDelete },
    { label: 'Batal', Icon: IconX, color: 'gray', variant: 'subtle', onClick: onClear },
  ];

  return (
    <Paper
      withBorder
      radius="md"
      p="xs"
      shadow="md"
      role="toolbar"
      aria-label="Aksi dokumen terpilih"
      style={{ position: 'sticky', bottom: 'var(--mantine-spacing-md)', zIndex: 5 }}
    >
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text fw="bold" fz="sm" aria-live="polite" style={{ whiteSpace: 'nowrap' }}>
          {count} dipilih
        </Text>
        <Group gap="xs" wrap="nowrap" visibleFrom="sm">
          {aksi.map(({ label, Icon, color, variant, onClick }) => (
            <Button key={label} size="xs" variant={variant} color={color} leftSection={<Icon size={14} />} onClick={onClick}>
              {label}
            </Button>
          ))}
        </Group>
        <Group gap={4} wrap="nowrap" hiddenFrom="sm">
          {aksi.map(({ label, Icon, color, variant, onClick }) => (
            <Tooltip key={label} label={label}>
              <ActionIcon size="lg" variant={variant} color={color} aria-label={label} onClick={onClick}>
                <Icon size={16} />
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>
      </Group>
    </Paper>
  );
}
