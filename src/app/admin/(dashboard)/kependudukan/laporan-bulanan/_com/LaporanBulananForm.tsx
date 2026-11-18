'use client'
import colors from '@/con/colors';
import {
  BANJAR_MAX_LENGTH,
  BULAN_LABEL,
  JUMLAH_MAX,
  TAHUN_MIN,
  tahunMaks,
  totalPenduduk,
} from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules';
import type { LaporanBulananInput } from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules';
import { Autocomplete, Button, Group, NumberInput, Paper, Select, Stack, TextInput } from '@mantine/core';

const bulanOptions = BULAN_LABEL.map((label, i) => ({ value: String(i + 1), label }));

const toCount = (v: string | number): number => (typeof v === 'number' ? v : 0);

type Props = {
  form: LaporanBulananInput;
  loading: boolean;
  submitLabel: string;
  /** Saran nama banjar dari Data Banjar; input tetap boleh teks bebas. */
  banjarOptions: string[];
  onSubmit: () => void;
};

/** Form laporan bulanan: banjar (saran + teks bebas), tahun, bulan (nama), jumlah L dan P, total L+P read-only. */
export default function LaporanBulananForm({ form, loading, submitLabel, banjarOptions, onSubmit }: Props) {
  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" w={{ base: '100%', md: '50%' }}>
      <Stack gap="md">
        <Autocomplete
          label="Banjar"
          description="Pilih dari saran atau ketik nama banjar"
          placeholder="Nama banjar"
          data={banjarOptions}
          maxLength={BANJAR_MAX_LENGTH}
          value={form.banjar}
          onChange={(v) => (form.banjar = v)}
          required
        />
        <Group grow align="flex-start">
          <NumberInput
            label="Tahun"
            min={TAHUN_MIN}
            max={tahunMaks()}
            allowDecimal={false}
            value={form.tahun}
            onChange={(v) => (form.tahun = toCount(v))}
            required
          />
          <Select
            label="Bulan"
            data={bulanOptions}
            value={String(form.bulan)}
            allowDeselect={false}
            onChange={(v) => { if (v) form.bulan = Number(v); }}
            required
          />
        </Group>
        <Group grow align="flex-start">
          <NumberInput
            label="Laki-laki"
            min={0}
            max={JUMLAH_MAX}
            allowDecimal={false}
            allowNegative={false}
            value={form.lakiLaki}
            onChange={(v) => (form.lakiLaki = toCount(v))}
            required
          />
          <NumberInput
            label="Perempuan"
            min={0}
            max={JUMLAH_MAX}
            allowDecimal={false}
            allowNegative={false}
            value={form.perempuan}
            onChange={(v) => (form.perempuan = toCount(v))}
            required
          />
        </Group>
        <TextInput
          label="Total (Laki-laki + Perempuan)"
          readOnly
          variant="filled"
          value={totalPenduduk(form).toLocaleString('id-ID')}
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
