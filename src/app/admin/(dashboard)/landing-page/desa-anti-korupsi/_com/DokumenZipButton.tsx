'use client';
import { unduhZipDak } from '@/lib/desa-anti-korupsi-zip-client';
import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconFileZip } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  programId: string;
  /** id folder, "umum", atau kosong untuk seluruh program. */
  folder?: string;
  /** Teks tombol; tanpa label → ikon saja (dipakai di header folder). */
  label?: string;
  /** Nama tujuan untuk aria-label/tooltip, mis. nama folder. */
  target: string;
  disabled?: boolean;
};

/** Tombol unduh ZIP dokumen (program atau satu folder) dengan loading sendiri; gagal → toast error. */
export function DokumenZipButton({ programId, folder, label, target, disabled = false }: Props) {
  const [loading, setLoading] = useState(false);

  const unduh = async () => {
    setLoading(true);
    try {
      const result = await unduhZipDak(programId, folder);
      if (!result.ok) toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  const ariaLabel = `Unduh ZIP ${target}`;
  if (label) {
    return (
      <Button
        variant="light"
        size="xs"
        leftSection={<IconFileZip size={16} />}
        loading={loading}
        disabled={disabled}
        onClick={unduh}
        aria-label={ariaLabel}
      >
        {label}
      </Button>
    );
  }
  return (
    <Tooltip label={disabled ? 'Folder kosong' : 'Unduh ZIP'}>
      <ActionIcon variant="subtle" size="lg" loading={loading} disabled={disabled} onClick={unduh} aria-label={ariaLabel}>
        <IconFileZip size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
