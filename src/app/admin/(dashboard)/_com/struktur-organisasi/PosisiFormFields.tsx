'use client'
import { NumberInput, Select, Switch, Textarea, TextInput } from '@mantine/core';
import type { PosisiFormValues, SelectOption, SetField } from './struktur-admin.logic';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

type Props = {
  values: PosisiFormValues;
  onChange: SetField<PosisiFormValues>;
  /** Pilihan atasan — sudah tanpa jabatan ini sendiri dan bawahannya (`parentOptions`). */
  atasanOptions: SelectOption[];
  /** Tampilkan saklar status aktif (form edit). */
  withStatus?: boolean;
};

/** NumberInput mengirim string kosong saat dihapus → null (belum diisi). */
const toNumber = (value: number | string): number | null => (typeof value === 'number' ? value : null);

/** Field form jabatan: nama + hierarki wajib; deskripsi, urutan, atasan opsional (atasan kosong = puncak). */
export function PosisiFormFields({ values, onChange, atasanOptions, withStatus }: Props) {
  return (
    <>
      <TextInput
        required
        label={T.posisi.nama}
        placeholder={T.posisi.namaPlaceholder}
        value={values.nama}
        onChange={(e) => onChange('nama', e.currentTarget.value)}
      />
      <Textarea
        autosize
        minRows={2}
        label={T.posisi.deskripsi}
        placeholder={T.posisi.deskripsiPlaceholder}
        value={values.deskripsi}
        onChange={(e) => onChange('deskripsi', e.currentTarget.value)}
      />
      <NumberInput
        required
        min={1}
        allowDecimal={false}
        label={T.posisi.hierarki}
        description={T.posisi.hierarkiHint}
        value={values.hierarki ?? ''}
        onChange={(value) => onChange('hierarki', toNumber(value))}
      />
      <NumberInput
        min={0}
        allowDecimal={false}
        allowNegative={false}
        label={T.posisi.urutan}
        description={T.posisi.urutanHint}
        value={values.urutan ?? ''}
        onChange={(value) => onChange('urutan', toNumber(value))}
      />
      <Select
        clearable
        searchable
        label={T.posisi.atasan}
        description={T.posisi.atasanHint}
        placeholder={T.posisi.atasanPlaceholder}
        data={atasanOptions}
        value={values.parentId || null}
        onChange={(value) => onChange('parentId', value ?? '')}
      />
      {withStatus ? (
        <Switch label={T.aktif} checked={values.isActive} onChange={(e) => onChange('isActive', e.currentTarget.checked)} />
      ) : null}
    </>
  );
}
