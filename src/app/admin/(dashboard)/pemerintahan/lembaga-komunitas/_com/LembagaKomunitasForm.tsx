'use client'
import type {
  FotoPilihan,
  LembagaKomunitasFoto,
  LembagaKomunitasFormValues,
} from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import ImageDropzoneField from '@/app/admin/_com/upload/ImageDropzoneField';
import colors from '@/con/colors';
import {
  DESKRIPSI_LEMBAGA_MAX,
  JENIS_LEMBAGA_MAX,
  KETUA_LEMBAGA_MAX,
  KONTAK_LEMBAGA_MAX,
  NAMA_LEMBAGA_MAX,
  URUTAN_LEMBAGA_MAX,
  URUTAN_LEMBAGA_MIN,
} from '@/lib/lembaga-komunitas';
import { Autocomplete, Button, Group, NumberInput, Paper, Stack, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from './lembaga-komunitas.text';

type Props = {
  /** Proxy Valtio isi form (state.create.form / state.edit.form); ditulis langsung, dibaca lewat snapshot sinkron. */
  form: LembagaKomunitasFormValues;
  loading: boolean;
  submitLabel: string;
  /** Foto yang sudah tersimpan (mode edit). */
  currentFoto?: LembagaKomunitasFoto | null;
  /** Jenis yang sudah dipakai, jadi saran isian (jenis tetap teks bebas). */
  jenisOptions: readonly string[];
  onSubmit: (foto: FotoPilihan) => void;
};

/** Form Lembaga & Komunitas: nama, jenis (saran dari yang ada), ketua, kontak lembaga, deskripsi, urutan, dan foto opsional. */
export default function LembagaKomunitasForm({ form, loading, submitLabel, currentFoto, jenisOptions, onSubmit }: Props) {
  // sync: true agar input terkontrol tidak loncat caret (snapshot Valtio default dibatch async).
  const snap = useSnapshot(form, { sync: true });
  const [fotoBaru, setFotoBaru] = useState<{ file: File; url: string } | null>(null);
  const [fotoDilepas, setFotoDilepas] = useState(false);

  // Object URL pratinjau dilepas saat pilihan diganti atau form ditutup (hindari bocor memori).
  useEffect(() => () => {
    if (fotoBaru) URL.revokeObjectURL(fotoBaru.url);
  }, [fotoBaru]);

  const previewUrl = fotoBaru?.url ?? (fotoDilepas ? null : (currentFoto?.link ?? null));

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
      <Stack gap="md">
        <TextInput
          label={T.formNama}
          placeholder={T.formNamaPlaceholder}
          maxLength={NAMA_LEMBAGA_MAX}
          value={snap.nama}
          onChange={(e) => (form.nama = e.currentTarget.value)}
          required
        />
        <Autocomplete
          label={T.formJenis}
          description={T.formJenisHint}
          data={[...jenisOptions]}
          maxLength={JENIS_LEMBAGA_MAX}
          value={snap.jenis}
          onChange={(value) => (form.jenis = value)}
          required
        />
        <TextInput
          label={T.formKetua}
          description={T.formKetuaHint}
          maxLength={KETUA_LEMBAGA_MAX}
          value={snap.ketua}
          onChange={(e) => (form.ketua = e.currentTarget.value)}
        />
        <TextInput
          label={T.formKontak}
          description={T.formKontakHint}
          maxLength={KONTAK_LEMBAGA_MAX}
          value={snap.kontak}
          onChange={(e) => (form.kontak = e.currentTarget.value)}
        />
        <Textarea
          label={T.formDeskripsi}
          description={T.formDeskripsiHint}
          maxLength={DESKRIPSI_LEMBAGA_MAX}
          autosize
          minRows={4}
          value={snap.deskripsi}
          onChange={(e) => (form.deskripsi = e.currentTarget.value)}
        />
        <NumberInput
          label={T.formUrutan}
          description={T.formUrutanHint}
          min={URUTAN_LEMBAGA_MIN}
          max={URUTAN_LEMBAGA_MAX}
          allowDecimal={false}
          allowNegative={false}
          value={snap.urutan}
          onChange={(value) => (form.urutan = typeof value === 'number' ? value : '')}
        />
        <ImageDropzoneField
          label={T.formFoto}
          description={T.formFotoHint}
          previewUrl={previewUrl}
          onPick={(file) => {
            setFotoBaru({ file, url: URL.createObjectURL(file) });
            setFotoDilepas(false);
          }}
          onRemove={() => {
            setFotoBaru(null);
            setFotoDilepas(true);
          }}
        />
        <Group justify="flex-end">
          <Button
            bg={colors['blue-button']}
            loading={loading}
            onClick={() => onSubmit({ file: fotoBaru?.file ?? null, hapus: fotoDilepas && !fotoBaru })}
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
