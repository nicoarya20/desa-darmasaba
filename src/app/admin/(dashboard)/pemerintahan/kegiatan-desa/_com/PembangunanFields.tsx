'use client'
import {
  PROGRES_MAX,
  PROGRES_MIN,
  STATUS_PEMBANGUNAN,
  STATUS_PEMBANGUNAN_LABEL,
  SUMBER_DANA_MAX_LENGTH,
} from '@/lib/kegiatan-pembangunan';
import { Divider, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';

export type PembangunanFormValues = {
  anggaran: number | null;
  progres: number | null;
  statusPembangunan: string | null;
  sumberDana: string | null;
};

const statusOptions = STATUS_PEMBANGUNAN.map((value) => ({
  value,
  label: STATUS_PEMBANGUNAN_LABEL[value],
}));

/** Input anggaran, progres, status, dan sumber dana — hanya untuk kegiatan kategori Pembangunan. */
export default function PembangunanFields({
  values,
  onChange,
}: {
  values: PembangunanFormValues;
  onChange: (patch: Partial<PembangunanFormValues>) => void;
}) {
  return (
    <Stack gap="md">
      <Divider label={<Text fz="sm" fw={600}>Data Pembangunan</Text>} labelPosition="left" />

      <NumberInput
        label="Anggaran (Rp)"
        placeholder="Contoh: 250.000.000"
        value={values.anggaran ?? ''}
        onChange={(val) => onChange({ anggaran: typeof val === 'number' ? val : null })}
        min={0}
        allowNegative={false}
        thousandSeparator="."
        decimalSeparator=","
        prefix="Rp "
        hideControls
      />

      <Select
        label="Status Pembangunan"
        placeholder="Pilih status"
        data={statusOptions}
        value={values.statusPembangunan}
        onChange={(val) => onChange({ statusPembangunan: val })}
        clearable
      />

      <NumberInput
        label="Progres (%)"
        description={`Isi ${PROGRES_MIN} sampai ${PROGRES_MAX}`}
        value={values.progres ?? ''}
        onChange={(val) => onChange({ progres: typeof val === 'number' ? val : null })}
        min={PROGRES_MIN}
        max={PROGRES_MAX}
        allowDecimal={false}
        allowNegative={false}
        suffix="%"
      />

      <TextInput
        label="Sumber Dana"
        placeholder="Contoh: APBDes, Dana Desa, Bantuan Provinsi"
        value={values.sumberDana ?? ''}
        onChange={(e) => onChange({ sumberDana: e.target.value || null })}
        maxLength={SUMBER_DANA_MAX_LENGTH}
      />
    </Stack>
  );
}
