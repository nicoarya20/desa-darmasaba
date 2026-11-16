import {
  ALAMAT_MAKS,
  NAMA_MAKS,
  TAHUN_MIN,
  tahunMaks,
  validasiPenerima,
  validasiTahun,
} from '@/lib/program-kemiskinan/penerima.rules';
import { Button, Group, Modal, NumberInput, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { FormPenerima } from '../../../_state/ekonomi/penerima-program-kemiskinan';

type Props = {
  /** Nilai awal; `id` terisi = mode ubah. */
  awal: FormPenerima;
  saving: boolean;
  onClose: () => void;
  onSimpan: (form: FormPenerima) => Promise<boolean>;
};

/** Modal tambah/ubah satu penerima (nama, alamat, tahun; status tampil hanya saat ubah). Dipasang ulang per buka. */
export function PenerimaFormModal({ awal, saving, onClose, onSimpan }: Props) {
  const [form, setForm] = useState<FormPenerima>(awal);
  const [galat, setGalat] = useState<string | null>(null);

  const simpan = async () => {
    const tahun = validasiTahun(form.tahun);
    const p = validasiPenerima(form);
    if (!tahun.ok) return setGalat(tahun.alasan);
    if (!p.ok) return setGalat(p.alasan);
    setGalat(null);
    if (await onSimpan({ ...form, ...p.value, tahun: tahun.value })) onClose();
  };

  return (
    <Modal opened onClose={onClose} title={<Text fw="bold">{awal.id ? 'Ubah Penerima' : 'Tambah Penerima'}</Text>} centered>
      <Stack gap="sm">
        <TextInput
          label="Nama"
          required
          maxLength={NAMA_MAKS}
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.currentTarget.value })}
        />
        <TextInput
          label="Alamat / Banjar"
          required
          maxLength={ALAMAT_MAKS}
          value={form.alamat}
          onChange={(e) => setForm({ ...form, alamat: e.currentTarget.value })}
        />
        <NumberInput
          label="Tahun"
          required
          min={TAHUN_MIN}
          max={tahunMaks()}
          allowDecimal={false}
          value={form.tahun}
          onChange={(v) => setForm({ ...form, tahun: Number(v) })}
        />
        {awal.id && (
          <Switch
            label="Tampil di halaman publik"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.currentTarget.checked })}
          />
        )}
        {galat && (
          <Text c="red" fz="sm" role="alert">
            {galat}
          </Text>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={simpan} loading={saving}>
            Simpan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
