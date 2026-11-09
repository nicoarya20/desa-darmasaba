'use client';
import { CloseButton, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type Props = { query: string; onQueryChange: (query: string) => void; shown: number; total: number };

/** Kotak cari editor: hanya menyaring tampilan (judul / nama berkas); draft & aksi massal tidak berubah. */
export function DokumenCariBox({ query, onQueryChange, shown, total }: Props) {
  const searching = query.trim() !== '';
  return (
    <Stack gap={4}>
      <TextInput
        size="xs"
        aria-label="Cari dokumen di editor"
        placeholder="Cari judul atau nama berkas…"
        leftSection={<IconSearch size={14} />}
        value={query}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
        rightSection={searching ? <CloseButton size="sm" aria-label="Hapus pencarian" onClick={() => onQueryChange('')} /> : null}
      />
      {searching && (
        <Text fz="xs" c="dimmed" aria-live="polite" data-cari-info>
          {shown === 0 ? `Tidak ada dokumen yang cocok dengan "${query.trim()}".` : `Menampilkan ${shown} dari ${total} dokumen.`}{' '}
          Pencarian hanya menyaring tampilan: &quot;Pilih semua&quot; memilih dokumen yang terlihat, sedangkan aksi massal
          berlaku untuk semua dokumen terpilih (termasuk yang sedang tersembunyi). Urutan naik/turun dinonaktifkan selama
          mencari.
        </Text>
      )}
    </Stack>
  );
}
