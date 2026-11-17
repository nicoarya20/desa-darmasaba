'use client';
import { URUTAN_MAX, URUTAN_MIN } from '@/lib/program-inovasi';
import { NumberInput } from '@mantine/core';

type Props = {
  value: number | null;
  onChange: (urutan: number | null) => void;
};

/** Input "Urutan tampil" Program Inovasi (opsional): angka kecil tampil paling depan, kosong = urut abjad di belakang. */
export function UrutanInput({ value, onChange }: Props) {
  return (
    <NumberInput
      label="Urutan tampil (opsional)"
      description="1 = paling depan di beranda dan halaman Program Inovasi. Kosongkan untuk urut abjad setelah yang bernomor."
      placeholder="Kosong"
      value={value ?? ''}
      onChange={(next) => onChange(typeof next === 'number' && Number.isFinite(next) ? next : null)}
      min={URUTAN_MIN}
      max={URUTAN_MAX}
      allowDecimal={false}
      allowNegative={false}
      clampBehavior="strict"
      w={{ base: '100%', sm: 260 }}
    />
  );
}
