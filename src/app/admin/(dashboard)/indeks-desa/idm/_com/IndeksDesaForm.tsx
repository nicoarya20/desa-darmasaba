'use client'
import type { IndeksDesaFormValues } from '@/app/admin/(dashboard)/_state/indeks-desa/indeksDesa';
import colors from '@/con/colors';
import {
  CATATAN_IDM_MAX,
  DIMENSI_IDM,
  STATUS_IDM,
  TAHUN_IDM_MAX,
  TAHUN_IDM_MIN,
  isStatusIdm,
} from '@/lib/indeks-desa';
import { Button, Group, NumberInput, Paper, Select, SimpleGrid, Stack, TextInput, Textarea } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { INDEKS_DESA_ADMIN_TEXT as T } from './indeks-desa.text';

type Props = {
  /** Proxy Valtio isi form (state.create.form / state.edit.form); ditulis langsung, dibaca lewat snapshot sinkron. */
  form: IndeksDesaFormValues;
  loading: boolean;
  submitLabel: string;
  onSubmit: () => void;
};

type SkorKey = 'skorIdm' | 'skorIks' | 'skorIke' | 'skorIkl';
const SKOR_FIELDS: ReadonlyArray<{ key: SkorKey; label: string }> = [
  { key: 'skorIdm', label: T.formSkorIdm },
  ...DIMENSI_IDM.map((d) => ({ key: d.key, label: T.formSkorDimensi(d.singkatan, d.nama) })),
];

/** Form Indeks Desa: tahun, empat skor (IDM, IKS, IKE, IKL), status resmi, dan catatan opsional. */
export default function IndeksDesaForm({ form, loading, submitLabel, onSubmit }: Props) {
  // sync: true agar input terkontrol tidak loncat caret (snapshot Valtio default dibatch async).
  const snap = useSnapshot(form, { sync: true });

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '70%' }}>
      <Stack gap="md">
        <NumberInput
          label={T.formTahun}
          description={T.formTahunHint}
          min={TAHUN_IDM_MIN}
          max={TAHUN_IDM_MAX}
          allowDecimal={false}
          value={snap.tahun ?? ''}
          onChange={(value) => (form.tahun = typeof value === 'number' ? value : null)}
          required
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {SKOR_FIELDS.map(({ key, label }) => (
            <TextInput
              key={key}
              label={label}
              description={key === 'skorIdm' ? T.formSkorHint : undefined}
              inputMode="decimal"
              value={snap[key]}
              onChange={(e) => (form[key] = e.currentTarget.value)}
              required
            />
          ))}
        </SimpleGrid>
        <Select
          label={T.formStatus}
          description={T.formStatusHint}
          data={[...STATUS_IDM]}
          value={snap.status}
          allowDeselect={false}
          onChange={(value) => {
            if (isStatusIdm(value)) form.status = value;
          }}
          required
        />
        <Textarea
          label={T.formCatatan}
          description={T.formCatatanHint}
          maxLength={CATATAN_IDM_MAX}
          autosize
          minRows={2}
          value={snap.catatan}
          onChange={(e) => (form.catatan = e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button bg={colors['blue-button']} loading={loading} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
