'use client';
import { Button, Select, Stack, Text, Textarea } from '@mantine/core';
import { useState } from 'react';
import { PENGADUAN_TANGGAPAN_MAX, parsePengaduanStatus, resolvePengaduanStatus, type PengaduanStatus } from '@/lib/pengaduan-status';
import { PENGADUAN_STATUS_OPTIONS } from './PengaduanStatusBadge';

export const TANGGAPAN_HELP = 'Jangan menulis nama/NIK pelapor — tanggapan ini tampil publik';

type Props = {
  /** Nilai tersimpan; `status` null dibaca BARU. */
  initial: { status: string | null; tanggapan: string | null };
  saving: boolean;
  onSave: (form: { status: PengaduanStatus; tanggapan: string }) => void;
};

/** Form admin ubah status + tanggapan pengaduan. Tanggapan tampil di rekap publik, jadi diberi peringatan data pribadi. */
export function PengaduanTanggapanForm({ initial, saving, onSave }: Props) {
  const [status, setStatus] = useState<PengaduanStatus>(resolvePengaduanStatus(initial.status));
  const [tanggapan, setTanggapan] = useState(initial.tanggapan ?? '');

  return (
    <Stack gap="xs">
      <Select
        label="Status penanganan"
        data={PENGADUAN_STATUS_OPTIONS}
        value={status}
        onChange={(value) => setStatus(parsePengaduanStatus(value) ?? status)}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true }}
      />
      <Textarea
        label="Tanggapan"
        description={TANGGAPAN_HELP}
        value={tanggapan}
        onChange={(e) => setTanggapan(e.currentTarget.value)}
        maxLength={PENGADUAN_TANGGAPAN_MAX}
        autosize
        minRows={3}
        maxRows={8}
      />
      <Text fz="xs" c="dimmed">{tanggapan.length}/{PENGADUAN_TANGGAPAN_MAX} karakter</Text>
      <Button w="fit-content" loading={saving} onClick={() => onSave({ status, tanggapan })}>
        Simpan status & tanggapan
      </Button>
    </Stack>
  );
}
