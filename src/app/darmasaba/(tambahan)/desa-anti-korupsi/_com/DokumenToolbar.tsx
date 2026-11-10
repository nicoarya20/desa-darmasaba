'use client';
import { Group, Select, TextInput } from '@mantine/core';
import { IconArrowsSort, IconSearch } from '@tabler/icons-react';
import { parseUrut, URUT_OPTIONS, type UrutValue } from '../_lib/program-urut';

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  urut: UrutValue;
  onUrutChange: (urut: UrutValue) => void;
  /** Select "Urutkan" hanya relevan saat daftar dokumen tampil (isi folder / hasil cari). */
  showUrut: boolean;
};

/** Baris alat halaman program: cari dokumen lintas folder + pilihan "Urutkan". */
export function DokumenToolbar({ query, onQueryChange, urut, onUrutChange, showUrut }: Props) {
  return (
    <Group gap="sm" align="flex-end" wrap="wrap">
      <TextInput
        placeholder="Cari judul dokumen di semua folder"
        aria-label="Cari judul dokumen"
        leftSection={<IconSearch size={16} />}
        value={query}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
        radius="xl"
        maw={480}
        style={{ flex: '1 1 260px' }}
      />
      {showUrut && (
        <Select
          aria-label="Urutkan dokumen"
          data-testid="urut-select"
          leftSection={<IconArrowsSort size={16} />}
          data={URUT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={urut}
          onChange={(value) => onUrutChange(parseUrut(value))}
          allowDeselect={false}
          radius="xl"
          w={{ base: '100%', xs: 200 }}
        />
      )}
    </Group>
  );
}
