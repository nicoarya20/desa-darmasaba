'use client'
import {
  ANGGOTA_TIM_MAX,
  JABATAN_ANGGOTA_MAX_LENGTH,
  NAMA_ANGGOTA_MAX_LENGTH,
  type TimPengelolaFormValues,
} from '@/lib/tim-pengelola';
import { ActionIcon, Box, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { TIM_REDAKSI_ADMIN_TEXT as T } from './tim-redaksi.text';

type Props = {
  /** Proxy Valtio isi form (state.form); daftar anggota ditulis langsung, dibaca lewat snapshot sinkron. */
  form: TimPengelolaFormValues;
};

/** Daftar anggota dinamis (nama + jabatan): tambah, hapus, dan geser urutan; jumlah dibatasi `ANGGOTA_TIM_MAX`. */
export default function TimRedaksiAnggotaField({ form }: Props) {
  // sync: true agar input terkontrol tidak loncat caret (snapshot Valtio default dibatch async).
  const snap = useSnapshot(form, { sync: true });

  const geser = (dari: number, ke: number) => {
    const [item] = form.anggota.splice(dari, 1);
    form.anggota.splice(ke, 0, item);
  };

  return (
    <Box>
      <Text fw={500} fz="sm">{T.anggotaTitle}</Text>
      <Text c="dimmed" fz="xs" mb={6}>{T.anggotaHint}</Text>
      <Stack gap="xs">
        {snap.anggota.length === 0 && <Text c="dimmed" fz="sm">{T.anggotaKosong}</Text>}
        {snap.anggota.map((anggota, i) => (
          <Group key={i} align="flex-start" gap="xs" wrap="nowrap">
            <TextInput
              aria-label={`${T.nama} ${i + 1}`}
              placeholder={T.nama}
              maxLength={NAMA_ANGGOTA_MAX_LENGTH}
              value={anggota.nama}
              onChange={(e) => (form.anggota[i].nama = e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <TextInput
              aria-label={`${T.jabatan} ${i + 1}`}
              placeholder={T.jabatan}
              maxLength={JABATAN_ANGGOTA_MAX_LENGTH}
              value={anggota.jabatan}
              onChange={(e) => (form.anggota[i].jabatan = e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <ActionIcon variant="light" size="lg" aria-label={`Naikkan anggota ${i + 1}`} disabled={i === 0} onClick={() => geser(i, i - 1)}>
              <IconArrowUp size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              size="lg"
              aria-label={`Turunkan anggota ${i + 1}`}
              disabled={i === snap.anggota.length - 1}
              onClick={() => geser(i, i + 1)}
            >
              <IconArrowDown size={16} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" size="lg" aria-label={`Hapus anggota ${i + 1}`} onClick={() => form.anggota.splice(i, 1)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            disabled={snap.anggota.length >= ANGGOTA_TIM_MAX}
            onClick={() => form.anggota.push({ nama: '', jabatan: '' })}
          >
            {T.anggotaTambah}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
