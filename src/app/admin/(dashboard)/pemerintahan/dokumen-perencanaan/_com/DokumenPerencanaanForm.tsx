'use client'
import type { DokumenPerencanaanForm as FormValues } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import colors from '@/con/colors';
import {
  NOMOR_PERDES_MAX_LENGTH,
  RINGKASAN_MAX_LENGTH,
  TAHUN_MAX,
  TAHUN_MIN,
  type JenisDokumen,
  type JenisMusyawarah,
} from '@/lib/dokumen-perencanaan';
import PdfDropzoneField from '@/app/admin/_com/upload/PdfDropzoneField';
import { Button, Divider, Group, NumberInput, Paper, Select, SimpleGrid, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { useState } from 'react';
import {
  DOKUMEN_ADMIN_TEXT,
  JENIS_OPTIONS,
  JUDUL_PLACEHOLDER,
  MUSYAWARAH_OPTIONS,
  RINGKASAN_HINT,
  TAHUN_HINT,
} from './dokumen-perencanaan.text';

const toYear = (v: string | number): number | null => (typeof v === 'number' ? v : null);

// Isian tahun: tanpa panah naik-turun (mengetik lebih cepat dari mengeklik) dan hanya bilangan bulat.
const TAHUN_INPUT_PROPS = { min: TAHUN_MIN, max: TAHUN_MAX, allowDecimal: false, hideControls: true } as const;

type Props = {
  form: FormValues;
  loading: boolean;
  submitLabel: string;
  currentFile?: { link: string; realName: string } | null;
  /** Judul formulir; bawaan nama halaman. */
  title?: string;
  onSubmit: (pdf: File | null) => void;
};

/** Form dokumen Arah Kebijakan Pembangunan Desa: field tahun/periode/musyawarah muncul sesuai jenis, plus unggah PDF. */
export default function DokumenPerencanaanForm({
  form,
  loading,
  submitLabel,
  currentFile,
  title = DOKUMEN_ADMIN_TEXT.pageTitle,
  onSubmit,
}: Props) {
  const [pdf, setPdf] = useState<File | null>(null);

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
      <Stack gap="md">
        <Title order={4}>{title}</Title>
        <Select
          label="Jenis Dokumen"
          data={JENIS_OPTIONS}
          value={form.jenis}
          allowDeselect={false}
          onChange={(v) => { if (v) form.jenis = v as JenisDokumen; }}
        />
        <TextInput
          label="Judul"
          placeholder={JUDUL_PLACEHOLDER[form.jenis]}
          value={form.judul}
          onChange={(e) => (form.judul = e.currentTarget.value)}
          required
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          {form.jenis === 'RPJM' ? (
            <>
              <NumberInput
                label="Tahun Mulai"
                description={DOKUMEN_ADMIN_TEXT.tahunMulaiHint}
                {...TAHUN_INPUT_PROPS}
                value={form.tahunMulai ?? ''}
                onChange={(v) => (form.tahunMulai = toYear(v))}
                required
              />
              <NumberInput
                label="Tahun Selesai"
                description={DOKUMEN_ADMIN_TEXT.tahunSelesaiHint}
                {...TAHUN_INPUT_PROPS}
                value={form.tahunSelesai ?? ''}
                onChange={(v) => (form.tahunSelesai = toYear(v))}
                required
              />
            </>
          ) : (
            <NumberInput
              label="Tahun"
              description={TAHUN_HINT[form.jenis] ?? DOKUMEN_ADMIN_TEXT.tahunDefaultHint}
              {...TAHUN_INPUT_PROPS}
              value={form.tahun ?? ''}
              onChange={(v) => (form.tahun = toYear(v))}
              required
            />
          )}
          <TextInput
            label="Nomor Perdes"
            description={DOKUMEN_ADMIN_TEXT.opsional}
            maxLength={NOMOR_PERDES_MAX_LENGTH}
            value={form.nomorPerdes}
            onChange={(e) => (form.nomorPerdes = e.currentTarget.value)}
          />
        </SimpleGrid>

        {form.jenis === 'BERITA_ACARA_MUSYAWARAH' && (
          <Select
            label="Jenis Musyawarah"
            placeholder="Pilih jenis musyawarah"
            data={MUSYAWARAH_OPTIONS}
            value={form.jenisMusyawarah}
            onChange={(v) => (form.jenisMusyawarah = v as JenisMusyawarah | null)}
            required
          />
        )}

        <Textarea
          label="Ringkasan"
          description={RINGKASAN_HINT[form.jenis] ?? DOKUMEN_ADMIN_TEXT.ringkasanDefault}
          autosize
          minRows={3}
          maxRows={8}
          maxLength={RINGKASAN_MAX_LENGTH}
          value={form.ringkasan}
          onChange={(e) => (form.ringkasan = e.currentTarget.value)}
        />

        <PdfDropzoneField label={DOKUMEN_ADMIN_TEXT.berkasHint} file={pdf} onChange={setPdf} currentFile={currentFile} />

        <Divider />
        <Group justify="flex-end">
          <Button bg={colors['blue-button']} loading={loading} onClick={() => onSubmit(pdf)}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
