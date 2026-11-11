'use client';
import colors from '@/con/colors';
import { Button } from '@mantine/core';
import { IconFileZip } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { jalankanUnduhZip } from '../_lib/program-zip';

type Props = { programId: string; folder: string | null; label: string; disabled: boolean };

/** Tombol unduh ZIP satu program (`folder` null) atau satu folder; loading selama proses, gagal → toast. */
export function UnduhZipButton({ programId, folder, label, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await jalankanUnduhZip(programId, folder, { onGagal: (message) => toast.error(message) });
    setLoading(false);
  };

  return (
    <Button
      variant="light"
      color={colors['blue-button']}
      size="xs"
      radius="xl"
      leftSection={<IconFileZip size={16} />}
      loading={loading}
      disabled={disabled}
      onClick={() => void handleClick()}
      data-zip-folder={folder ?? 'semua'}
    >
      {label}
    </Button>
  );
}
