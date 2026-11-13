'use client';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

type Props = {
  opened: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  confirmColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Dialog konfirmasi generik untuk aksi berisiko (bukan hapus data). */
export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel,
  confirmColor = 'blue',
  loading,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered radius="md" closeOnClickOutside={!loading}>
      <Stack gap="lg">
        {typeof message === 'string' ? <Text size="sm">{message}</Text> : message}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button color={confirmColor} onClick={onConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
