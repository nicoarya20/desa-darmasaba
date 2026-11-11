'use client'
import { TextInput } from '@mantine/core';

/** Isian Tanggal Terbit berita (`YYYY-MM-DD`, dibaca WITA oleh API) untuk form tambah & edit. */
export function TanggalTerbitInput({
  value,
  onChange,
  description = 'Tanggal asli berita/kegiatan; default hari ini',
}: {
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <TextInput
      type="date"
      label="Tanggal Terbit"
      description={description}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      required
      data-berita-tanggal-terbit
    />
  );
}
