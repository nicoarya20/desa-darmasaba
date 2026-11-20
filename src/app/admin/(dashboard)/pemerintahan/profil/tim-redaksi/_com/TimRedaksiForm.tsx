'use client'
import PdfDropzoneField from '@/app/admin/_com/upload/PdfDropzoneField';
import colors from '@/con/colors';
import { NOMOR_SK_MAX_LENGTH, type TimPengelolaFileRef, type TimPengelolaFormValues } from '@/lib/tim-pengelola';
import { Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import TimRedaksiAnggotaField from './TimRedaksiAnggotaField';
import { TIM_REDAKSI_ADMIN_TEXT as T } from './tim-redaksi.text';

type Props = {
  /** Proxy Valtio isi form (state.form); ditulis langsung, dibaca lewat snapshot sinkron. */
  form: TimPengelolaFormValues;
  /** PDF SK yang sudah tersimpan (ditampilkan sebagai tautan); null bila belum ada. */
  currentFile: TimPengelolaFileRef | null;
  loading: boolean;
  /** Simpan form + PDF baru (null = berkas tersimpan tidak diubah); true bila tersimpan. */
  onSubmit: (pdf: File | null) => Promise<boolean>;
};

/** Form Tim Redaksi: nomor SK, tanggal SK, unggah PDF SK, dan daftar anggota. */
export default function TimRedaksiForm({ form, currentFile, loading, onSubmit }: Props) {
  // sync: true agar input terkontrol tidak loncat caret (snapshot Valtio default dibatch async).
  const snap = useSnapshot(form, { sync: true });
  const [pdf, setPdf] = useState<File | null>(null);

  const simpan = async () => {
    if (await onSubmit(pdf)) setPdf(null);
  };

  return (
    <Paper withBorder bg={colors['white-1']} p="xl" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
      <Stack gap="md">
        <div>
          <Title order={3} mb={4}>{T.title}</Title>
          <Text size="sm" c="dimmed">{T.lead}</Text>
        </div>
        <TextInput
          label={T.nomorSk}
          description={T.nomorSkHint}
          maxLength={NOMOR_SK_MAX_LENGTH}
          value={snap.nomorSk}
          onChange={(e) => (form.nomorSk = e.currentTarget.value)}
          required
        />
        <TextInput
          label={T.tanggalSk}
          type="date"
          value={snap.tanggalSk}
          onChange={(e) => (form.tanggalSk = e.currentTarget.value)}
        />
        <PdfDropzoneField label={T.pdfSk} description={T.pdfSkHint} file={pdf} onChange={setPdf} currentFile={currentFile} />
        <TimRedaksiAnggotaField form={form} />
        <Group justify="flex-end">
          <Button bg={colors['blue-button']} loading={loading} onClick={() => void simpan()}>
            {T.submit}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
