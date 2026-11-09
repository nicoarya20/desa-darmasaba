'use client';
import { DETAIL_SORT_OPTIONS, toDetailSortValue, type DetailSortValue } from '../_lib/detail-view';
import { CloseButton, Group, Select, Text, TextInput } from '@mantine/core';
import { IconSearch, IconSortAscending } from '@tabler/icons-react';

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  sort: DetailSortValue;
  onSortChange: (s: DetailSortValue) => void;
  /** Jumlah dokumen yang cocok; ditampilkan hanya saat mencari. */
  total: number;
  searching: boolean;
};

const SORT_DATA = DETAIL_SORT_OPTIONS.map(({ value, label }) => ({ value, label }));

/** Toolbar detail admin: cari judul/nama berkas lintas folder + pilihan urutan tampilan. */
export function DokumenToolbarCariUrut({ query, onQueryChange, sort, onSortChange, total, searching }: Props) {
  return (
    <>
      <Group gap="sm" align="flex-end" wrap="wrap">
        <TextInput
          style={{ flex: '1 1 220px' }}
          aria-label="Cari dokumen"
          placeholder="Cari judul atau nama file"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => onQueryChange(e.currentTarget.value)}
          rightSection={
            query ? <CloseButton size="sm" aria-label="Hapus pencarian" onClick={() => onQueryChange('')} /> : null
          }
        />
        <Select
          style={{ flex: '0 1 200px' }}
          aria-label="Urutkan dokumen"
          leftSection={<IconSortAscending size={16} />}
          data={SORT_DATA}
          value={sort}
          allowDeselect={false}
          onChange={(v) => onSortChange(toDetailSortValue(v))}
        />
      </Group>
      {searching && (
        <Text fz="sm" c="dimmed" data-testid="jumlah-hasil-cari">
          {total} dokumen ditemukan
        </Text>
      )}
    </>
  );
}
