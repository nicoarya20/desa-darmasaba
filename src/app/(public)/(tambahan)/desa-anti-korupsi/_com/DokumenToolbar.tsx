'use client';
import { SearchField } from '@/app/(public)/_com/search-field/SearchField';
import { Group, Select } from '@mantine/core';
import { IconArrowsSort } from '@tabler/icons-react';
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
    <Group gap="sm" align="flex-end" wrap="wrap" style={{ flex: '1 1 320px' }}>
      <div style={{ flex: '1 1 260px', maxWidth: 480 }}>
        <SearchField
          fullWidth
          label="Cari judul dokumen"
          placeholder="Cari judul dokumen di semua folder"
          value={query}
          onChange={onQueryChange}
        />
      </div>
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
