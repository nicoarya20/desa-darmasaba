'use client'
import PdfDropzoneField from '@/app/admin/_com/upload/PdfDropzoneField';
import type { ProdukHukumFile, ProdukHukumFormValues } from '@/app/admin/(dashboard)/_state/desa/produkHukum';
import colors from '@/con/colors';
import {
  JUDUL_PRODUK_HUKUM_MAX,
  KATEGORI_PRODUK_HUKUM,
  KATEGORI_PRODUK_HUKUM_LABEL,
  NOMOR_PRODUK_HUKUM_MAX,
  TAHUN_PRODUK_HUKUM_MAX,
  TAHUN_PRODUK_HUKUM_MIN,
  isKategoriProdukHukum,
} from '@/lib/produk-hukum';
import { Button, Group, NumberInput, Paper, Select, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from './produk-hukum.text';

const kategoriOptions = KATEGORI_PRODUK_HUKUM.map((value) => ({ value, label: KATEGORI_PRODUK_HUKUM_LABEL[value] }));

type Props = {
  /** Proxy Valtio isi form (state.create.form / state.edit.form); ditulis langsung, dibaca lewat snapshot sinkron. */
  form: ProdukHukumFormValues;
  loading: boolean;
  submitLabel: string;
  currentFile?: ProdukHukumFile | null;
  onSubmit: (pdf: File | null) => void;
};

/** Form produk hukum: kategori, judul, nomor, tahun, dan unggah PDF opsional. */
export default function ProdukHukumForm({ form, loading, submitLabel, currentFile, onSubmit }: Props) {
  // sync: true agar input terkontrol tidak loncat caret (snapshot Valtio default dibatch async).
  const snap = useSnapshot(form, { sync: true });
  const [pdf, setPdf] = useState<File | null>(null);

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
      <Stack gap="md">
        <Select
          label={T.formKategori}
          data={kategoriOptions}
          value={snap.kategori}
          allowDeselect={false}
          onChange={(value) => {
            if (isKategoriProdukHukum(value)) form.kategori = value;
          }}
        />
        <TextInput
          label={T.formJudul}
          placeholder={T.formJudulPlaceholder}
          maxLength={JUDUL_PRODUK_HUKUM_MAX}
          value={snap.judul}
          onChange={(e) => (form.judul = e.currentTarget.value)}
          required
        />
        <TextInput
          label={T.formNomor}
          description={T.formNomorHint}
          maxLength={NOMOR_PRODUK_HUKUM_MAX}
          value={snap.nomor}
          onChange={(e) => (form.nomor = e.currentTarget.value)}
        />
        <NumberInput
          label={T.formTahun}
          description={T.formTahunHint}
          min={TAHUN_PRODUK_HUKUM_MIN}
          max={TAHUN_PRODUK_HUKUM_MAX}
          allowDecimal={false}
          value={snap.tahun ?? ''}
          onChange={(value) => (form.tahun = typeof value === 'number' ? value : null)}
        />
        <PdfDropzoneField label={T.formPdf} description={T.formPdfHint} file={pdf} onChange={setPdf} currentFile={currentFile} />
        <Group justify="flex-end">
          <Button bg={colors['blue-button']} loading={loading} onClick={() => onSubmit(pdf)}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
