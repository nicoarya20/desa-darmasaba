'use client'
import type { DokumenPerencanaanForm as FormValues } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import colors from '@/con/colors';
import {
  JENIS_DOKUMEN,
  JENIS_DOKUMEN_LABEL,
  JENIS_MUSYAWARAH,
  JENIS_MUSYAWARAH_LABEL,
  NOMOR_PERDES_MAX_LENGTH,
  RINGKASAN_MAX_LENGTH,
  TAHUN_MAX,
  TAHUN_MIN,
  type JenisDokumen,
  type JenisMusyawarah,
} from '@/lib/dokumen-perencanaan';
import { Button, Group, NumberInput, Paper, Select, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const MAX_PDF_SIZE_MB = 10;

const jenisOptions = JENIS_DOKUMEN.map((v) => ({ value: v, label: JENIS_DOKUMEN_LABEL[v] }));
const musyawarahOptions = JENIS_MUSYAWARAH.map((v) => ({ value: v, label: JENIS_MUSYAWARAH_LABEL[v] }));

const toYear = (v: string | number): number | null => (typeof v === 'number' ? v : null);

type Props = {
  form: FormValues;
  loading: boolean;
  submitLabel: string;
  currentFile?: { link: string; realName: string } | null;
  onSubmit: (pdf: File | null) => void;
};

/** Form dokumen perencanaan: field tahun/periode/musyawarah muncul sesuai jenis, plus unggah PDF. */
export default function DokumenPerencanaanForm({ form, loading, submitLabel, currentFile, onSubmit }: Props) {
  const [pdf, setPdf] = useState<File | null>(null);

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
      <Stack gap="md">
        <Select
          label="Jenis Dokumen"
          data={jenisOptions}
          value={form.jenis}
          allowDeselect={false}
          onChange={(v) => { if (v) form.jenis = v as JenisDokumen; }}
        />
        <TextInput
          label="Judul"
          placeholder="Judul dokumen"
          value={form.judul}
          onChange={(e) => (form.judul = e.currentTarget.value)}
          required
        />

        {form.jenis === 'RPJM' ? (
          <Group grow align="flex-start">
            <NumberInput
              label="Tahun Mulai"
              min={TAHUN_MIN}
              max={TAHUN_MAX}
              allowDecimal={false}
              value={form.tahunMulai ?? ''}
              onChange={(v) => (form.tahunMulai = toYear(v))}
              required
            />
            <NumberInput
              label="Tahun Selesai"
              description="Bebas, mengikuti masa jabatan (6 atau 8 tahun)"
              min={TAHUN_MIN}
              max={TAHUN_MAX}
              allowDecimal={false}
              value={form.tahunSelesai ?? ''}
              onChange={(v) => (form.tahunSelesai = toYear(v))}
              required
            />
          </Group>
        ) : (
          <NumberInput
            label="Tahun"
            min={TAHUN_MIN}
            max={TAHUN_MAX}
            allowDecimal={false}
            value={form.tahun ?? ''}
            onChange={(v) => (form.tahun = toYear(v))}
            required
          />
        )}

        {form.jenis === 'BERITA_ACARA_MUSYAWARAH' && (
          <Select
            label="Jenis Musyawarah"
            placeholder="Pilih jenis musyawarah"
            data={musyawarahOptions}
            value={form.jenisMusyawarah}
            onChange={(v) => (form.jenisMusyawarah = v as JenisMusyawarah | null)}
            required
          />
        )}

        <TextInput
          label="Nomor Perdes"
          description="Opsional"
          maxLength={NOMOR_PERDES_MAX_LENGTH}
          value={form.nomorPerdes}
          onChange={(e) => (form.nomorPerdes = e.currentTarget.value)}
        />
        <Textarea
          label="Ringkasan"
          description="Opsional"
          autosize
          minRows={3}
          maxRows={8}
          maxLength={RINGKASAN_MAX_LENGTH}
          value={form.ringkasan}
          onChange={(e) => (form.ringkasan = e.currentTarget.value)}
        />

        <Stack gap={6}>
          <Text fw="bold" fz="sm">Berkas PDF (Opsional)</Text>
          {currentFile && !pdf && (
            <Text fz="sm" c="dimmed">
              Berkas saat ini: <a href={currentFile.link} target="_blank" rel="noreferrer">{currentFile.realName}</a>. Pilih berkas baru untuk menggantinya.
            </Text>
          )}
          <Dropzone
            onDrop={(files) => setPdf(files[0] ?? null)}
            onReject={() => toast.error(`Berkas harus PDF dengan ukuran maksimal ${MAX_PDF_SIZE_MB} MB`)}
            accept={PDF_MIME_TYPE}
            maxSize={MAX_PDF_SIZE_MB * 1024 ** 2}
            multiple={false}
            radius="md"
            p="lg"
          >
            <Group justify="center" gap="md" mih={90}>
              <Dropzone.Accept><IconUpload size={36} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
              <Dropzone.Reject><IconX size={36} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
              <Dropzone.Idle><IconFile size={36} color="#868e96" stroke={1.5} /></Dropzone.Idle>
              <Text size="sm" ta="center">
                {pdf ? pdf.name : 'Seret PDF atau klik untuk memilih'}
              </Text>
            </Group>
          </Dropzone>
          {pdf && (
            <Button variant="subtle" color="red" size="compact-sm" w="fit-content" onClick={() => setPdf(null)}>
              Batalkan pilihan berkas
            </Button>
          )}
        </Stack>

        <Group justify="flex-end">
          <Button bg={colors['blue-button']} loading={loading} onClick={() => onSubmit(pdf)}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
